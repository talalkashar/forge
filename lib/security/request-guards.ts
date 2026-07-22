import "server-only";

/** Reject oversized bodies before JSON parse (DoS / memory abuse). */
export function assertContentLength(
  headers: Pick<Headers, "get">,
  maxBytes: number,
) {
  const raw = headers.get("content-length");
  if (!raw) {
    return;
  }

  const length = Number(raw);
  if (Number.isFinite(length) && length > maxBytes) {
    throw new RequestGuardError(
      `Request body too large (max ${maxBytes} bytes).`,
      413,
    );
  }
}

export class RequestGuardError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "RequestGuardError";
    this.status = status;
  }
}

export function isRequestGuardError(error: unknown): error is RequestGuardError {
  return error instanceof RequestGuardError;
}
