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

  it("redirects non-admin users to vehicles", () => {
    useAuthStore.setState({
      token: "test-token",
      user: {
        id: "1",
        role: "USER",
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
            path="/vehicles"
            element={<div>Vehicles</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Vehicles")).toBeInTheDocument();
  });

  it("allows admin users", () => {
    useAuthStore.setState({
      token: "test-token",
      user: {
        id: "1",
        role: "ADMIN",
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
