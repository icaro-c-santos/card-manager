import { NextResponse } from "next/server";
import prisma from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    const installment = await prisma.installment.findUnique({
      where: { id },
      select: { paymentReceipt: true },
    });

    if (!installment || !installment.paymentReceipt) {
      return new NextResponse("Receipt not found", { status: 404 });
    }

    // Return the image as binary data
    return new NextResponse(new Uint8Array(installment.paymentReceipt), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error fetching receipt:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

