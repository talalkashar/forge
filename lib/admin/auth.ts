import "server-only";

import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const ADMIN_COOKIE_NAME = "forge_admin";

function adminPassword() {
  return process.env.ADMIN_DASHBOARD_PASSWORD;
}

function passwordDigest(value: string) {
  return createHash("sha256").update(`forge-admin:${value}`).digest("hex");
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 60 * 60 * 8,
  };
}

export function hasAdminPassword() {
  return Boolean(adminPassword());
}

export async function isAdminAuthenticated() {
  const password = adminPassword();

  if (!password) {
    return false;
  }

  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!cookieValue) {
    return false;
  }

  const expected = passwordDigest(password);

  try {
    return timingSafeEqual(Buffer.from(cookieValue), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function setAdminSession() {
  const password = adminPassword();

  if (!password) {
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, passwordDigest(password), cookieOptions());
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, "", {
    ...cookieOptions(),
    maxAge: 0,
  });
}

export function verifyAdminPassword(input: string) {
  const password = adminPassword();

  if (!password) {
    return false;
  }

  try {
    return timingSafeEqual(Buffer.from(input), Buffer.from(password));
  } catch {
    return false;
  }
}
