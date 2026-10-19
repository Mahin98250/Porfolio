import { z } from "zod";
import {
  apiErrorSchema,
  customerProfileSchema,
  sellerInventorySchema,
  type ApiErrorPayload,
  type CustomerProfile,
  type SellerInventory,
} from "./schemas.js";

export type ApiResult<T> =
  | { ok: true; data: T; requestId?: string }
  | {
      ok: false;
      error: {
        code: "NETWORK_ERROR" | "TIMEOUT" | "HTTP_ERROR" | "INVALID_RESPONSE";
        message: string;
        requestId?: string;
      };
    };

export interface ApiClientOptions {
  baseUrl: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeRequestId(value: unknown): string | undefined {
  if (!isRecord(value)) return undefined;
  const candidate = value.requestId;
  return typeof candidate === "string" && candidate.length <= 128 ? candidate : undefined;
}

function mapApiError(payload: unknown, status: number): ApiResult<never> {
  const parsed = apiErrorSchema.safeParse(payload);
  if (parsed.success) {
    const body: ApiErrorPayload = parsed.data;
    return {
      ok: false,
      error: {
        code: "HTTP_ERROR",
        message: body.message,
        ...(body.requestId ? { requestId: body.requestId } : {}),
      },
    };
  }

  const requestId = safeRequestId(payload);
  return {
    ok: false,
    error: {
      code: "HTTP_ERROR",
      message: status >= 500
        ? "The service is temporarily unavailable. Please try again."
        : "The request could not be completed.",
      ...(requestId === undefined ? {} : { requestId }),
    },
  };
}

export function createMarketplaceApi(options: ApiClientOptions) {
  const baseUrl = options.baseUrl.replace(/\/$/, "");
  const timeoutMs = options.timeoutMs ?? 8_000;
  const fetchImpl = options.fetchImpl ?? fetch;

  async function getValidated<T>(
    path: string,
    schema: z.ZodType<T>,
    signal?: AbortSignal,
  ): Promise<ApiResult<T>> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const forwardAbort = () => controller.abort();
    signal?.addEventListener("abort", forwardAbort, { once: true });

    try {
      const response = await fetchImpl(new URL(path.replace(/^\//, ""), `${baseUrl}/`), {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        signal: controller.signal,
      });

      let payload: unknown;
      try {
        payload = await response.json();
      } catch {
        return {
          ok: false,
          error: {
            code: "INVALID_RESPONSE",
            message: "The service returned an unreadable response.",
          },
        };
      }

      const payloadRequestId = safeRequestId(payload);
      if (!response.ok) return mapApiError(payload, response.status);

      const parsed = schema.safeParse(payload);
      if (!parsed.success) {
        return {
          ok: false,
          error: {
            code: "INVALID_RESPONSE",
            message: "The service response changed unexpectedly. Please retry later.",
            ...(payloadRequestId === undefined ? {} : { requestId: payloadRequestId }),
          },
        };
      }

      return {
        ok: true,
        data: parsed.data,
        ...(safeRequestId(payload) ? { requestId: safeRequestId(payload) } : {}),
      };
    } catch {
      const timedOut = controller.signal.aborted;
      return {
        ok: false,
        error: {
          code: timedOut ? "TIMEOUT" : "NETWORK_ERROR",
          message: timedOut
            ? "The request timed out. Check your connection and retry."
            : "Unable to reach the service. Check your connection and retry.",
        },
      };
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", forwardAbort);
    }
  }

  return {
    getSellerInventory(sellerId: string, signal?: AbortSignal) {
      return getValidated(
        `api/sellers/${encodeURIComponent(sellerId)}/inventory`,
        sellerInventorySchema,
        signal,
      );
    },
    getCustomerProfile(customerId: string, signal?: AbortSignal) {
      return getValidated(
        `api/customers/${encodeURIComponent(customerId)}`,
        customerProfileSchema,
        signal,
      );
    },
  };
}

/** Server-only configuration belongs in server route handlers, never NEXT_PUBLIC_*. */
export function createServerApiBaseUrl(value: string | undefined): string {
  if (!value) throw new Error("MARKETPLACE_API_BASE_URL is not configured");
  const url = new URL(value);
  if (url.protocol !== "https:" && url.hostname !== "localhost") {
    throw new Error("Marketplace API base URL must use HTTPS");
  }
  return url.toString();
}

export type { CustomerProfile, SellerInventory };
