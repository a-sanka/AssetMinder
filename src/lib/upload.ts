import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function saveUploadedFile(
  file: File,
  category: "floor-plans" | "assets"
): Promise<{ url: string; width?: number; height?: number }> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Invalid file type. Only PNG, JPG, and WebP are allowed.");
  }

  if (file.size > MAX_SIZE) {
    throw new Error("File too large. Maximum size is 10MB.");
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", category);
  await mkdir(uploadDir, { recursive: true });

  const ext = file.name.split(".").pop() || "png";
  const filename = `${crypto.randomUUID()}.${ext}`;
  const filepath = path.join(uploadDir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  let width: number | undefined;
  let height: number | undefined;

  if (category === "floor-plans") {
    const { imageSize } = await import("image-size");
    const dimensions = imageSize(buffer);
    width = dimensions.width;
    height = dimensions.height;
  }

  return {
    url: `/uploads/${category}/${filename}`,
    width,
    height,
  };
}
