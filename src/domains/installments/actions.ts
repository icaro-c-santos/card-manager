"use server";

import { revalidatePath } from "next/cache";
import { getInstallmentById } from "./queries";
import { markInstallmentAsPaid, markInstallmentAsPending } from "./mutations";

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

    // Convert base64 to Buffer if receipt provided
    let receiptBuffer: Buffer | undefined;
    if (receiptBase64) {
      // Remove data URL prefix if present
      const base64Data = receiptBase64.replace(/^data:image\/\w+;base64,/, "");
      receiptBuffer = Buffer.from(base64Data, "base64");
    }

    await markInstallmentAsPaid(id, receiptBuffer);

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

    await markInstallmentAsPending(id);

    revalidatePath("/installments");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error unpaying installment:", error);
    return { success: false, error: "Erro ao desfazer pagamento" };
  }
}

