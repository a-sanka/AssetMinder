import { describe, it, expect } from "vitest";
import { encodeLocationQr, encodeAssetQr, parseQrData } from "@/lib/qr";

describe("QR encoding", () => {
  it("encodes a location QR code", () => {
    expect(encodeLocationQr("abc123")).toBe("am://L/abc123");
  });

  it("encodes an asset QR code", () => {
    expect(encodeAssetQr("xyz789")).toBe("am://A/xyz789");
  });

  it("encodes with CUID-like IDs", () => {
    const cuid = "cm5abc123def456";
    expect(encodeLocationQr(cuid)).toBe(`am://L/${cuid}`);
    expect(encodeAssetQr(cuid)).toBe(`am://A/${cuid}`);
  });
});

describe("QR parsing", () => {
  it("parses a location QR code", () => {
    const result = parseQrData("am://L/abc123");
    expect(result).toEqual({ type: "location", id: "abc123" });
  });

  it("parses an asset QR code", () => {
    const result = parseQrData("am://A/xyz789");
    expect(result).toEqual({ type: "asset", id: "xyz789" });
  });

  it("returns unknown for random text", () => {
    const result = parseQrData("https://example.com");
    expect(result).toEqual({ type: "unknown", raw: "https://example.com" });
  });

  it("returns unknown for empty string", () => {
    const result = parseQrData("");
    expect(result).toEqual({ type: "unknown", raw: "" });
  });

  it("returns unknown for partial match", () => {
    const result = parseQrData("am://X/abc");
    expect(result).toEqual({ type: "unknown", raw: "am://X/abc" });
  });

  it("returns unknown for missing ID (empty after slash)", () => {
    const result = parseQrData("am://L/");
    // Regex `.+` requires at least one char, so empty ID is correctly rejected
    expect(result).toEqual({ type: "unknown", raw: "am://L/" });
  });

  it("handles IDs with special characters", () => {
    const result = parseQrData("am://A/id-with-dashes_and_underscores");
    expect(result).toEqual({
      type: "asset",
      id: "id-with-dashes_and_underscores",
    });
  });

  it("roundtrips: encode then parse location", () => {
    const id = "cm5test123";
    const encoded = encodeLocationQr(id);
    const parsed = parseQrData(encoded);
    expect(parsed).toEqual({ type: "location", id });
  });

  it("roundtrips: encode then parse asset", () => {
    const id = "cm5test456";
    const encoded = encodeAssetQr(id);
    const parsed = parseQrData(encoded);
    expect(parsed).toEqual({ type: "asset", id });
  });
});
