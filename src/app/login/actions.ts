"use server";

import { validateCredentials, generateToken, setAuthCookie } from "@/lib/auth";

export async function loginAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const login = formData.get("login") as string;
  const password = formData.get("password") as string;

  if (!login || !password) {
    return { success: false, error: "Usuário e senha são obrigatórios" };
  }

  const isValid = await validateCredentials(login, password);

  if (!isValid) {
    return { success: false, error: "Usuário ou senha inválidos" };
  }

  const token = generateToken(login);
  await setAuthCookie(token);

  return { success: true };
}

