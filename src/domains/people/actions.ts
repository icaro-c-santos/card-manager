"use server";

import { revalidatePath } from "next/cache";
import { createPerson, updatePerson, deletePerson } from "./mutations";

export async function createPersonAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const name = formData.get("name") as string;

  if (!name || name.trim().length === 0) {
    return { success: false, error: "Nome é obrigatório" };
  }

  try {
    await createPerson(name.trim());
    revalidatePath("/people");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error creating person:", error);
    return { success: false, error: "Erro ao criar pessoa" };
  }
}

export async function updatePersonAction(
  id: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const name = formData.get("name") as string;

  if (!name || name.trim().length === 0) {
    return { success: false, error: "Nome é obrigatório" };
  }

  try {
    await updatePerson(id, name.trim());
    revalidatePath("/people");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error updating person:", error);
    return { success: false, error: "Erro ao atualizar pessoa" };
  }
}

export async function deletePersonAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await deletePerson(id);
    revalidatePath("/people");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting person:", error);
    return { success: false, error: "Erro ao excluir pessoa" };
  }
}

