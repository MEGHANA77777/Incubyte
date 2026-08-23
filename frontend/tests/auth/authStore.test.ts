import { beforeEach, describe, expect, it } from "vitest";

import { useAuthStore } from "../../src/store/authStore";

describe("authStore", () => {
  beforeEach(() => {
    localStorage.clear();

    useAuthStore.setState({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it("starts logged out", () => {
    const state = useAuthStore.getState();

    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("clears authentication on logout", () => {
    useAuthStore.setState({
      token: "test-token",
      user: {
        id: "1",
        role: "user",
      },
      isAuthenticated: true,
      isLoading: false,
    });

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();

    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
