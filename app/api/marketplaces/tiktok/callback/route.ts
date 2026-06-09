import { NextRequest, NextResponse } from "next/server";
import {
  exchangeTikTokAuthorizationCodeDisabled,
  parseTikTokOAuthCallback,
} from "@/lib/marketplaces/tiktok/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderMessage({
  title,
  status,
  details,
}: {
  title: string;
  status: "success" | "warning" | "error";
  details: string[];
}) {
  const color =
    status === "success"
      ? "#34d399"
      : status === "warning"
        ? "#fbbf24"
        : "#f87171";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      :root { color-scheme: dark; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #050505;
        color: #f5f5f5;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      main {
        width: min(680px, calc(100vw - 32px));
        border: 1px solid rgba(255,255,255,0.12);
        background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03));
        padding: 32px;
      }
      .eyebrow {
        color: ${color};
        font-size: 12px;
        font-weight: 900;
        letter-spacing: 0.22em;
        text-transform: uppercase;
      }
      h1 {
        margin: 12px 0 16px;
        font-size: clamp(28px, 6vw, 48px);
        line-height: 0.95;
        letter-spacing: -0.04em;
      }
      ul {
        margin: 24px 0 0;
        padding-left: 20px;
        color: #d1d5db;
        line-height: 1.7;
      }
      a {
        color: #fff;
        font-weight: 800;
      }
    </style>
  </head>
  <body>
    <main>
      <p class="eyebrow">TikTok Shop OAuth</p>
      <h1>${escapeHtml(title)}</h1>
      <ul>
        ${details.map((detail) => `<li>${escapeHtml(detail)}</li>`).join("")}
      </ul>
      <p style="margin-top: 28px;">
        <a href="/admin/sync/tiktok">Return to TikTok sync readiness</a>
      </p>
    </main>
  </body>
</html>`;
}

export async function GET(request: NextRequest) {
  const callback = parseTikTokOAuthCallback(request.nextUrl.searchParams);

  if (callback.status === "error") {
    return new NextResponse(
      renderMessage({
        title: "TikTok authorization returned an error",
        status: "error",
        details: [
          `Error: ${callback.error ?? "unknown"}`,
          callback.errorDescription
            ? `Description: ${callback.errorDescription}`
            : "No error description was provided.",
          "No tokens were requested, stored, logged, or written to Supabase.",
        ],
      }),
      {
        status: 400,
        headers: { "content-type": "text/html; charset=utf-8" },
      },
    );
  }

  if (callback.status === "missing_code") {
    return new NextResponse(
      renderMessage({
        title: "Waiting for TikTok authorization",
        status: "warning",
        details: [
          "This callback route is installed and ready for TikTok redirects.",
          "No authorization code was present in this request.",
          "Token exchange is disabled until explicitly approved.",
          "No tokens were requested, stored, logged, or written to Supabase.",
        ],
      }),
      {
        status: 400,
        headers: { "content-type": "text/html; charset=utf-8" },
      },
    );
  }

  const exchange = await exchangeTikTokAuthorizationCodeDisabled();

  return new NextResponse(
    renderMessage({
      title: "TikTok authorization callback received",
      status: "success",
      details: [
        callback.hasState
          ? "A state parameter was present."
          : "No state parameter was present.",
        exchange.message,
        "The authorization code was not displayed, logged, exchanged, or stored.",
        "Next step after TikTok approval: enable a reviewed token exchange flow and store resulting env vars securely.",
      ],
    }),
    {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
    },
  );
}
