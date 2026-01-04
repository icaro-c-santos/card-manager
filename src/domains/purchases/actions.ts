"use server";

import { revalidatePath } from "next/cache";
import { createPurchase, deletePurchase } from "./mutations";

export async function createPurchaseAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const personId = formData.get("personId") as string;
  const purchaseDateStr = formData.get("purchaseDate") as string;
  const description = formData.get("description") as string;
  const totalAmountStr = formData.get("totalAmount") as string;
  const installmentsCountStr = formData.get("installmentsCount") as string;

  // Validate required fields
  if (!personId) {
    return { success: false, error: "Pessoa é obrigatória" };
  }

  if (!purchaseDateStr) {
    return { success: false, error: "Data da compra é obrigatória" };
  }

  if (!totalAmountStr) {
    return { success: false, error: "Valor total é obrigatório" };
  }

  if (!installmentsCountStr) {
    return { success: false, error: "Número de parcelas é obrigatório" };
  }

  const totalAmount = parseFloat(totalAmountStr.replace(",", "."));
  const installmentsCount = parseInt(installmentsCountStr, 10);
  const purchaseDate = new Date(purchaseDateStr);

  if (isNaN(totalAmount) || totalAmount <= 0) {
    return { success: false, error: "Valor total inválido" };
  }

  if (isNaN(installmentsCount) || installmentsCount < 1 || installmentsCount > 48) {
    return { success: false, error: "Número de parcelas deve ser entre 1 e 48" };
  }

  try {
    await createPurchase({
      personId,
      purchaseDate,
      description: description || undefined,
      totalAmount,
      installmentsCount,
    });

    revalidatePath("/purchases");
    revalidatePath("/installments");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error creating purchase:", error);
    return { success: false, error: "Erro ao criar compra" };
  }
}

export async function deletePurchaseAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await deletePurchase(id);
    revalidatePath("/purchases");
    revalidatePath("/installments");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting purchase:", error);
    return { success: false, error: "Erro ao excluir compra" };
  }
}

