import { render, screen } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../../src/components/auth/ProtectedRoute";
import { useAuthStore } from "../../src/store/authStore";

describe("ProtectedRoute", () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it("redirects unauthenticated users to login", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={<div>Dashboard</div>}
            />
          </Route>

          <Route
            path="/login"
            element={<div>Login Page</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("renders protected content for authenticated users", () => {
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
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={<div>Dashboard</div>}
            />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });
});
