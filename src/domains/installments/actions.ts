"use server";

import { revalidatePath } from "next/cache";
import { getInstallmentById, getInstallmentsByPersonAndPeriod } from "./queries";
import {
  markInstallmentAsPaid,
  markInstallmentAsPending,
  markInstallmentsForPersonPeriodAsPaid,
} from "./mutations";
import { uploadBuffer, deleteFile } from "@/lib/minio-storage";

function parseReceiptBase64(receiptBase64: string) {
  const match = receiptBase64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  const contentType = match ? match[1] : "image/png";
  const base64Data = match
    ? match[2]
    : receiptBase64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");
  const extension = contentType.split("/")[1] || "png";

  return { buffer, contentType, extension };
}

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
      const { buffer, contentType, extension } = parseReceiptBase64(receiptBase64);
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

export async function payInstallmentsByPeriodAction(
  personId: string,
  month: number,
  year: number,
  receiptBase64?: string
): Promise<{ success: boolean; error?: string; updated?: number }> {
  try {
    const installments = await getInstallmentsByPersonAndPeriod(personId, month, year);
    if (!installments.length) {
      return { success: false, error: "Nenhuma parcela encontrada para este período" };
    }

    let receiptPath: string | undefined;
    if (receiptBase64) {
      const { buffer, contentType, extension } = parseReceiptBase64(receiptBase64);
      const key = `receipts/${personId}-${year}-${month}-${Date.now()}.${extension}`;
      receiptPath = await uploadBuffer(key, buffer, contentType);
    }

    const { updated } = await markInstallmentsForPersonPeriodAsPaid(
      personId,
      month,
      year,
      receiptPath
    );

    revalidatePath("/installments");
    revalidatePath("/dashboard");

    return { success: true, updated };
  } catch (error) {
    console.error("Error paying installments by period:", error);
    return { success: false, error: "Erro ao pagar parcelas do mês" };
  }
}
