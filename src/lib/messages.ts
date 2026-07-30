function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map(
        (key) =>
          `${JSON.stringify(key)}:${stableStringify(record[key])}`,
      )
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export function buildActionMessage({
  action,
  wallet,
  payload,
  timestamp = new Date().toISOString(),
}: {
  action: string;
  wallet: string;
  payload: unknown;
  timestamp?: string;
}) {
  return [
    "FlowEarn authorization",
    `Action: ${action}`,
    `Wallet: ${wallet}`,
    `Payload: ${stableStringify(payload)}`,
    `Timestamp: ${timestamp}`,
  ].join("\n");
}

export function verifyActionMessage({
  message,
  action,
  wallet,
  payload,
}: {
  message: string;
  action: string;
  wallet: string;
  payload: unknown;
}) {
  const timestamp = message.match(/^Timestamp: (.+)$/m)?.[1];
  if (!timestamp) return false;
  return (
    message === buildActionMessage({ action, wallet, payload, timestamp }) &&
    Math.abs(Date.now() - Date.parse(timestamp)) < 300_000
  );
}
