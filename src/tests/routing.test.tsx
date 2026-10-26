import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import App from "../App";

const mockUser = {
  uid: "test-user-id",
  email: "test@example.com",
};

// vi.mock factories are hoisted above imports, so shared state must be hoisted too.
const state = vi.hoisted(() => ({
  user: null as { uid: string; email: string } | null,
  loading: false,
  fetchSubscriptions: vi.fn(),
}));

vi.mock("@/integrations/firebase/auth", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    user: state.user,
    loading: state.loading,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn(),
  }),
}));

vi.mock("@/integrations/firebase/subscriptions", () => ({
  fetchSubscriptions: state.fetchSubscriptions,
  addSubscription: vi.fn(),
  updateSubscription: vi.fn(),
  deleteSubscription: vi.fn(),
}));

// App renders its own BrowserRouter, so tests drive navigation through the real history API.
const renderAt = (path: string) => {
  window.history.pushState({}, "", path);
  return render(<App />);
};

describe("Routing and redirects", () => {
  beforeEach(() => {
    state.user = null;
    state.loading = false;
    state.fetchSubscriptions.mockReset();
    state.fetchSubscriptions.mockResolvedValue([]);
  });

  describe("unauthenticated user", () => {
    it("redirects / to /login", async () => {
      renderAt("/");
      await waitFor(() => expect(window.location.pathname).toBe("/login"));
    });

    it("shows the login page at /login", async () => {
      renderAt("/login");
      expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    });

    it("redirects /dashboard to /login", async () => {
      renderAt("/dashboard");
      await waitFor(() => expect(window.location.pathname).toBe("/login"));
      expect(state.fetchSubscriptions).not.toHaveBeenCalled();
    });

    it("shows a 404 page for unknown routes", async () => {
      renderAt("/unknown-route");
      expect(await screen.findByText("404")).toBeInTheDocument();
      expect(screen.getByText(/Page not found/i)).toBeInTheDocument();
    });
  });

  describe("authenticated user", () => {
    beforeEach(() => {
      state.user = mockUser;
    });

    it("redirects / to /dashboard", async () => {
      renderAt("/");
      await waitFor(() => expect(window.location.pathname).toBe("/dashboard"));
    });

    it("redirects /login to /dashboard", async () => {
      renderAt("/login");
      await waitFor(() => expect(window.location.pathname).toBe("/dashboard"));
    });

    it("shows the dashboard and loads the user's subscriptions", async () => {
      renderAt("/dashboard");
      expect(await screen.findByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
      expect(state.fetchSubscriptions).toHaveBeenCalledWith(mockUser.uid);
      expect(screen.getByText("No subscriptions yet")).toBeInTheDocument();
      // With nothing tracked, amounts use the default currency (INR).
      const summary = screen.getByRole("region", { name: "Spending summary" });
      expect(within(summary).getAllByText("₹0.00").length).toBeGreaterThanOrEqual(2); // monthly and yearly
    });

    it("shows a retryable error when subscriptions fail to load", async () => {
      state.fetchSubscriptions.mockRejectedValue(new Error("The query requires an index."));
      renderAt("/dashboard");
      expect(await screen.findByRole("alert", {}, { timeout: 5000 })).toHaveTextContent(
        "The query requires an index."
      );
      expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
    });

    it("shows a 404 page with a home link for unknown routes", async () => {
      renderAt("/unknown-route");
      expect(await screen.findByText("404")).toBeInTheDocument();
      expect(screen.getByText("Return to Home")).toBeInTheDocument();
    });
  });

  describe("while auth is resolving", () => {
    it("does not redirect protected routes before the auth state is known", async () => {
      state.loading = true;
      renderAt("/dashboard");
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(window.location.pathname).toBe("/dashboard");
    });
  });
});
