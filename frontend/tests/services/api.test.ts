import { afterEach, describe, expect, it, vi } from "vitest";

import { api, checkHealth } from "../../src/services/api";

describe("API client", () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("uses the configured API client", () => {
    expect(api.defaults.baseURL).toBe(
      import.meta.env.VITE_API_URL ||
        "http://localhost:8000"
    );
  });

  it("calls the health endpoint", async () => {
    const getSpy = vi
      .spyOn(api, "get")
      .mockResolvedValueOnce({
        data: {
          status: "healthy",
        },
      } as never);

    const result = await checkHealth();

    expect(getSpy).toHaveBeenCalledWith("/health");

    expect(result).toEqual({
      status: "healthy",
    });
  });

  it("adds the bearer token to authenticated requests", async () => {
    localStorage.setItem(
      "access_token",
      "test-token"
    );

    const handlers =
      api.interceptors.request.handlers;

    const fulfilled = handlers?.[0]?.fulfilled;

    expect(fulfilled).toBeDefined();

    const config = await fulfilled!({
      headers: {},
    } as never);

    expect(config.headers.Authorization).toBe(
      "Bearer test-token"
    );
  });
});
