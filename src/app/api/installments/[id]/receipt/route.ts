import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { downloadBuffer } from "@/lib/minio-storage";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const forceDownload = url.searchParams.get("download") === "true";
    
    const installment = await prisma.installment.findUnique({
      where: { id },
      select: { paymentReceipt: true },
    });

    if (!installment || !installment.paymentReceipt) {
      return new NextResponse("Receipt not found", { status: 404 });
    }

    // Download from MinIO
    const buffer = await downloadBuffer(installment.paymentReceipt);

    // Determine content type from file extension
    const extension = installment.paymentReceipt.split(".").pop()?.toLowerCase() || "png";
    const contentType = extension === "jpg" || extension === "jpeg"
      ? "image/jpeg"
      : extension === "gif"
      ? "image/gif"
      : extension === "webp"
      ? "image/webp"
      : "image/png";

    const headers: HeadersInit = {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    };

    // Add Content-Disposition header for download
    if (forceDownload) {
      headers["Content-Disposition"] = `attachment; filename="comprovante-${id}.${extension}"`;
    }

    // Return the image as binary data
    return new NextResponse(buffer, { headers });
  } catch (error) {
    console.error("Error fetching receipt:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

