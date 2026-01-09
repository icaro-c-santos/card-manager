"use server";

import { revalidatePath } from "next/cache";
import { getInstallmentById } from "./queries";
import { markInstallmentAsPaid, markInstallmentAsPending } from "./mutations";
import { uploadBuffer, deleteFile } from "@/lib/minio-storage";

export async function payInstallmentAction(
  id: string,
  receiptBase64?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if installment exists
    const installment = await getInstallmentById(id);
    if (!installment) {
      return { success: false, error: "Parcela não encontrada" };
    }

    // Check if already paid
    if (installment.status === "PAID") {
      return { success: false, error: "Parcela já foi paga" };
    }

    // Upload to MinIO if receipt provided
    let receiptPath: string | undefined;
    if (receiptBase64) {
      // Extract content type and base64 data
      const match = receiptBase64.match(/^data:(image\/\w+);base64,(.+)$/);
      const contentType = match ? match[1] : "image/png";
      const base64Data = match
        ? match[2]
        : receiptBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      // Generate unique key for the receipt
      const extension = contentType.split("/")[1] || "png";
      const key = `receipts/${id}-${Date.now()}.${extension}`;

      receiptPath = await uploadBuffer(key, buffer, contentType);
    }

    await markInstallmentAsPaid(id, receiptPath);

    revalidatePath("/installments");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error paying installment:", error);
    return { success: false, error: "Erro ao pagar parcela" };
  }
}

export async function unpayInstallmentAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const installment = await getInstallmentById(id);
    if (!installment) {
      return { success: false, error: "Parcela não encontrada" };
    }

    if (installment.status !== "PAID") {
      return { success: false, error: "Parcela não está paga" };
    }

    // Delete receipt from MinIO if exists
    if (installment.paymentReceipt) {
      try {
        await deleteFile(installment.paymentReceipt);
      } catch (err) {
        console.error("Error deleting receipt from MinIO:", err);
      }
    }

    await markInstallmentAsPending(id);

    revalidatePath("/installments");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error unpaying installment:", error);
    return { success: false, error: "Erro ao desfazer pagamento" };
  }
}
