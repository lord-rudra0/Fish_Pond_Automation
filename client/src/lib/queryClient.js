import { QueryClient } from "@tanstack/react-query";
import { authService } from "./auth.js";

async function throwIfResNotOk(res) {
  if (!res.ok) {
    let errorMessage = res.statusText;
    
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // If JSON parsing fails, try to get text
      try {
        const text = await res.text();
        errorMessage = text || errorMessage;
      } catch {
        // Use default status text
      }
    }
    
    throw new Error(errorMessage);
  }
}

export async function apiRequest(
  method,
  url,
  data,
) {
  const headers = {
    ...authService.getAuthHeaders()
  };
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  await throwIfResNotOk(res);
  return res;
}

export const getQueryFn = ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Handle query parameters from queryKey
    let url = '';
    const params = {};
    
    // Separate URL parts from parameters
    queryKey.forEach((part, index) => {
      if (typeof part === 'string') {
        if (index === 0) {
          url = part;
        } else {
          url += '/' + part;
        }
      } else if (typeof part === 'object' && part !== null) {
        Object.assign(params, part);
      }
    });
    
    // Add query parameters if they exist
    if (Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const paramString = searchParams.toString();
      if (paramString) {
        url += `?${paramString}`;
      }
    }

    const res = await fetch(url, {
      headers: {
        ...authService.getAuthHeaders()
      }
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
}); 