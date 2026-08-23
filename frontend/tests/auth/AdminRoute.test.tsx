import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import AdminRoute from "../../src/components/auth/AdminRoute";
import { useAuthStore } from "../../src/store/authStore";

describe("AdminRoute", () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it("redirects non-admin users to dashboard", () => {
    useAuthStore.setState({
      token: "test-token",
      user: {
        id: "1",
        role: "user",
      },
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route element={<AdminRoute />}>
            <Route
              path="/admin"
              element={<div>Admin Page</div>}
            />
          </Route>

          <Route
            path="/dashboard"
            element={<div>Dashboard</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("allows admin users", () => {
    useAuthStore.setState({
      token: "test-token",
      user: {
        id: "1",
        role: "admin",
      },
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route element={<AdminRoute />}>
            <Route
              path="/admin"
              element={<div>Admin Page</div>}
            />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Admin Page")).toBeInTheDocument();
  });
});
