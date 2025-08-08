import { QueryClient, QueryFunction } from "@tanstack/react-query";

// ✅ Reusable helper: throw if response is not OK
async function throwIfResNotOk(res: Response): Promise<void> {
  if (!res.ok) {
    const errorText = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status}: ${errorText}`);
  }
}

// ✅ Unified request config builder
function buildHeaders(
  skipAuth = false,
  customHeaders?: Record<string, string>
) {
  const token = !skipAuth ? localStorage.getItem("token") : null;

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...customHeaders,
  };
}

// ✅ Safe redirect on 401
function handle401(isAuthRequest: boolean) {
  if (!isAuthRequest) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/auth?session_expired=true";
    throw new Error("Authentication required");
  }
}

// ✅ Generic API request
export async function apiRequest<T = any>(
  method: string,
  url: string,
  data?: unknown,
  options?: {
    skipAuth?: boolean;
    headers?: Record<string, string>;
  }
): Promise<T> {
  const skipAuth = options?.skipAuth || url.includes("/auth/");
  const headers = buildHeaders(skipAuth, options?.headers);

  const config: RequestInit = {
    method,
    headers,
    ...(data ? { body: JSON.stringify(data) } : {}),
  };

  const response = await fetch(url, config);

  if (response.status === 401) {
    handle401(skipAuth);
  }

  await throwIfResNotOk(response);

  try {
    return (await response.json()) as T;
  } catch {
    return {} as T; // fallback if no JSON body
  }
}

// ✅ Generic query function for React Query
export const getQueryFn =
  <T>(options?: { on401?: "returnNull" | "throw" }): QueryFunction<T> =>
  async ({ queryKey }) => {
    const url = Array.isArray(queryKey) ? queryKey.join("/") : String(queryKey);
    const isAuthRequest = url.includes("/auth/");
    const headers = buildHeaders(isAuthRequest);

    const response = await fetch(url, { headers, credentials: "include" });

    if (response.status === 401) {
      if (options?.on401 === "returnNull") {
        return null as T;
      }
      handle401(isAuthRequest);
    }

    await throwIfResNotOk(response);

    try {
      return (await response.json()) as T;
    } catch {
      return {} as T;
    }
  };

// ✅ Shared QueryClient
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        if (
          error instanceof Error &&
          error.message === "Authentication required"
        ) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

// ✅ Utility for auth requests (skip token)
export const authRequest = <T = any>(
  method: string,
  url: string,
  data?: unknown
): Promise<T> => {
  return apiRequest<T>(method, url, data, { skipAuth: true });
};
