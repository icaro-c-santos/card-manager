import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret-change-me";
const AUTH_LOGIN = process.env.AUTH_LOGIN || "admin";
const AUTH_PASSWORD = process.env.AUTH_PASSWORD || "password";
const TOKEN_EXPIRY = "24h";
const COOKIE_NAME = "auth_token";

export interface JWTPayload {
  login: string;
  iat: number;
  exp: number;
}

/**
 * Validates login credentials against environment variables
 */
export async function validateCredentials(
  login: string,
  password: string
): Promise<boolean> {
  return login === AUTH_LOGIN && password === AUTH_PASSWORD;
}

/**
 * Generates a JWT token for the authenticated user
 */
export function generateToken(login: string): string {
  return jwt.sign({ login }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

/**
 * Verifies and decodes a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Sets the auth token cookie
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });
}

/**
 * Gets the auth token from cookies
 */
export async function getAuthCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  return cookie?.value || null;
}

/**
 * Removes the auth token cookie
 */
export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Checks if the current request is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthCookie();
  if (!token) return false;
  const payload = verifyToken(token);
  return payload !== null;
}

/**
 * Gets the current user from the token
 */
export async function getCurrentUser(): Promise<string | null> {
  const token = await getAuthCookie();
  if (!token) return null;
  const payload = verifyToken(token);
  return payload?.login || null;
}

