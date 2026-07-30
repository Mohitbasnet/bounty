import Database from "better-sqlite3";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), ".data");
fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, "flowearn.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    owner_wallet TEXT NOT NULL,
    website TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    company_id TEXT NOT NULL REFERENCES companies(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('draft', 'live', 'closed')),
    treasury_wallet TEXT NOT NULL,
    encrypted_treasury_secret TEXT NOT NULL,
    budget_micro INTEGER NOT NULL,
    funded_micro INTEGER NOT NULL DEFAULT 0,
    paid_micro INTEGER NOT NULL DEFAULT 0,
    reserved_micro INTEGER NOT NULL DEFAULT 0,
    unlock_views INTEGER NOT NULL,
    views_per_block INTEGER NOT NULL,
    reward_per_block_micro INTEGER NOT NULL,
    max_per_creator_micro INTEGER NOT NULL,
    duration_days INTEGER NOT NULL,
    starts_at TEXT,
    ends_at TEXT,
    funding_signature TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL REFERENCES campaigns(id),
    creator_wallet TEXT NOT NULL,
    x_post_url TEXT NOT NULL,
    x_post_id TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL CHECK(status IN ('pending', 'approved', 'rejected')),
    views INTEGER NOT NULL DEFAULT 0,
    likes INTEGER NOT NULL DEFAULT 0,
    reposts INTEGER NOT NULL DEFAULT 0,
    replies INTEGER NOT NULL DEFAULT 0,
    accrued_micro INTEGER NOT NULL DEFAULT 0,
    paid_micro INTEGER NOT NULL DEFAULT 0,
    approved_at TEXT,
    last_synced_at TEXT,
    payout_signature TEXT,
    created_at TEXT NOT NULL,
    UNIQUE(campaign_id, x_post_id)
  );

  CREATE TABLE IF NOT EXISTS payouts (
    id TEXT PRIMARY KEY,
    submission_id TEXT NOT NULL REFERENCES submissions(id),
    campaign_id TEXT NOT NULL REFERENCES campaigns(id),
    gross_micro INTEGER NOT NULL,
    creator_micro INTEGER NOT NULL,
    fee_micro INTEGER NOT NULL,
    signature TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL CHECK(status IN ('pending', 'confirmed', 'failed')),
    error TEXT,
    created_at TEXT NOT NULL,
    confirmed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS x_oauth_states (
    state TEXT PRIMARY KEY,
    wallet TEXT NOT NULL,
    code_verifier TEXT NOT NULL,
    redirect_uri TEXT NOT NULL,
    return_to TEXT NOT NULL,
    expires_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS x_accounts (
    wallet TEXT PRIMARY KEY,
    x_user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    display_name TEXT NOT NULL,
    encrypted_access_token TEXT NOT NULL,
    encrypted_refresh_token TEXT,
    token_expires_at TEXT,
    connected_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

function ensureColumn(table: string, column: string, definition: string) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as {
    name: string;
  }[];
  if (!columns.some((item) => item.name === column)) {
    try {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    } catch (cause) {
      if (
        !(cause instanceof Error) ||
        !cause.message.includes("duplicate column name")
      ) {
        throw cause;
      }
    }
  }
}

ensureColumn("campaigns", "refunded_micro", "INTEGER NOT NULL DEFAULT 0");
ensureColumn("campaigns", "refund_signature", "TEXT");
ensureColumn("campaigns", "refund_state", "TEXT NOT NULL DEFAULT 'idle'");
ensureColumn(
  "campaigns",
  "refund_pending_micro",
  "INTEGER NOT NULL DEFAULT 0",
);
ensureColumn("submissions", "payout_state", "TEXT NOT NULL DEFAULT 'idle'");
ensureColumn("submissions", "x_author_id", "TEXT");
ensureColumn("submissions", "x_author_handle", "TEXT");
ensureColumn(
  "submissions",
  "ownership_verified",
  "INTEGER NOT NULL DEFAULT 0",
);
ensureColumn("submissions", "linked_x_user_id", "TEXT");
ensureColumn("submissions", "linked_x_handle", "TEXT");

function getEncryptionKey() {
  const configured = process.env.TREASURY_ENCRYPTION_KEY;
  if (configured) {
    return crypto.createHash("sha256").update(configured).digest();
  }

  const keyPath = path.join(dataDir, "treasury.key");
  if (!fs.existsSync(keyPath)) {
    fs.writeFileSync(keyPath, crypto.randomBytes(32), { mode: 0o600 });
  }
  return fs.readFileSync(keyPath);
}

export function encryptSecret(secret: Uint8Array) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(Buffer.from(secret)),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decryptSecret(payload: string) {
  const buffer = Buffer.from(payload, "base64");
  const iv = buffer.subarray(0, 12);
  const tag = buffer.subarray(12, 28);
  const encrypted = buffer.subarray(28);
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    iv,
  );
  decipher.setAuthTag(tag);
  return new Uint8Array(
    Buffer.concat([decipher.update(encrypted), decipher.final()]),
  );
}

export function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replaceAll("-", "")}`;
}

export function slugify(value: string) {
  const base = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base || "campaign"}-${crypto.randomBytes(3).toString("hex")}`;
}

export default db;
