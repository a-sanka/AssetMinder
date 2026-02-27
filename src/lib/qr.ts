export type QrPayload =
  | { type: "location"; id: string }
  | { type: "asset"; id: string }
  | { type: "unknown"; raw: string };

export function encodeLocationQr(id: string): string {
  return `am://L/${id}`;
}

export function encodeAssetQr(id: string): string {
  return `am://A/${id}`;
}

export function parseQrData(raw: string): QrPayload {
  const match = raw.match(/^am:\/\/(L|A)\/(.+)$/);
  if (!match) return { type: "unknown", raw };

  const [, typeChar, id] = match;
  return {
    type: typeChar === "L" ? "location" : "asset",
    id,
  };
}
