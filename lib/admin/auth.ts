import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const ADMIN_COOKIE_NAME = "forge_admin";
const SESSION_VERSION = "v2";

function adminPassword() {
  return process.env.ADMIN_DASHBOARD_PASSWORD;
}

/**
 * Prefer ADMIN_SESSION_SECRET in production so rotating the dashboard
 * password does not require understanding of cookie format, and the
 * session token is not a pure password hash.
 */
function sessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_DASHBOARD_PASSWORD ||
    ""
  );
}

function signSessionToken() {
  const password = adminPassword();
  const secret = sessionSecret();
  if (!password || !secret) {
    return null;
  }

  return createHmac("sha256", secret)
    .update(`${SESSION_VERSION}:forge-admin:${password}`)
    .digest("hex");
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

function safeEqualHex(a: string, b: string) {
  try {
    const left = Buffer.from(a, "utf8");
    const right = Buffer.from(b, "utf8");
    if (left.length !== right.length) {
      return false;
    }
    return timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

export function hasAdminPassword() {
  return Boolean(adminPassword());
}

export async function isAdminAuthenticated() {
  const expected = signSessionToken();
  if (!expected) {
    return false;
  }

  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!cookieValue) {
    return false;
  }

  return safeEqualHex(cookieValue, expected);
}

export async function setAdminSession() {
  const token = signSessionToken();
  if (!token) {
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, cookieOptions());
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
    const left = Buffer.from(input, "utf8");
    const right = Buffer.from(password, "utf8");
    if (left.length !== right.length) {
      return false;
    }
    return timingSafeEqual(left, right);
  } catch {
    return false;
  }
}
