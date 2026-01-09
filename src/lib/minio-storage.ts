import type { Client as MinioClient } from "minio";

let client: MinioClient | null = null;
let bucket: string | null = null;

async function ensureClient() {
  if (client) return;

  const endpoint = process.env.MINIO_ENDPOINT;
  const port = process.env.MINIO_PORT
    ? Number(process.env.MINIO_PORT)
    : undefined;
  const useSSL =
    (process.env.MINIO_USE_SSL || "false").toLowerCase() === "true";
  const accessKey = process.env.MINIO_ROOT_USER;
  const secretKey = process.env.MINIO_ROOT_PASSWORD;
  bucket = process.env.MINIO_BUCKET_NAME || "card-manager";

  if (!endpoint || !accessKey || !secretKey || !bucket) {
    throw new Error("MinIO is not configured");
  }

  const { Client } = await import("minio");
  client = new Client({
    endPoint: endpoint,
    port,
    useSSL,
    accessKey,
    secretKey,
  });

  const exists = await client.bucketExists(bucket);
  if (!exists) {
    await client.makeBucket(bucket, "");
  }
}

export async function uploadBuffer(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  await ensureClient();
  if (!client || !bucket) throw new Error("MinIO client not ready");
  await client.putObject(bucket, key, buffer, buffer.length, {
    "Content-Type": contentType,
  });
  return key;
}

export async function uploadFile(
  key: string,
  buffer: Buffer,
  contentType?: string
): Promise<string> {
  return uploadBuffer(key, buffer, contentType || "application/octet-stream");
}

export async function generateDownloadUrl(
  path: string,
  expiresInSeconds = 3600
): Promise<string> {
  await ensureClient();
  if (!client || !bucket) throw new Error("MinIO client not ready");
  const url = await client.presignedGetObject(bucket, path, expiresInSeconds);
  return url;
}

export async function downloadBuffer(path: string): Promise<Buffer> {
  await ensureClient();
  if (!client || !bucket) throw new Error("MinIO client not ready");
  const stream = await client.getObject(bucket, path);
  const chunks: Buffer[] = [];
  return await new Promise<Buffer>((resolve, reject) => {
    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", (err: Error) => reject(err));
  });
}

export async function deleteFile(path: string): Promise<void> {
  await ensureClient();
  if (!client || !bucket) throw new Error("MinIO client not ready");
  await client.removeObject(bucket, path);
}

export async function ping(): Promise<boolean> {
  try {
    await ensureClient();
    if (!client || !bucket) return false;
    const exists = await client.bucketExists(bucket);
    return Boolean(exists);
  } catch {
    return false;
  }
}
