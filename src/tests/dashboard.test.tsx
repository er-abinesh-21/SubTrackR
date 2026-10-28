import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { addDays, addMonths, format } from "date-fns";
import Dashboard from "../pages/Dashboard";
import { Subscription } from "@/types";

const api = vi.hoisted(() => ({
  fetchSubscriptions: vi.fn(),
  addSubscription: vi.fn(),
  updateSubscription: vi.fn(),
  deleteSubscription: vi.fn(),
}));

vi.mock("@/integrations/firebase/auth", () => ({
  useAuth: () => ({ user: { uid: "u1", email: "me@example.com" } }),
}));
vi.mock("@/integrations/firebase/subscriptions", () => api);
// jsdom has no layout engine, so Recharts cannot size itself; the chart is not under test here.
vi.mock("@/components/CategoryChart", () => ({ CategoryChart: () => null }));

const inDays = (n: number) => format(addDays(new Date(), n), "yyyy-MM-dd");

const make = (overrides: Partial<Subscription>): Subscription => ({
  id: "x",
  user_id: "u1",
  name: "Sub",
  price: 10,
  currency: "USD",
  category: "Entertainment",
  billing_cycle: "monthly",
  next_due_date: inDays(30),
  is_active: true,
  created_at: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

const SUBS = [
  make({ id: "a", name: "Netflix", price: 15, next_due_date: inDays(3) }),
  make({ id: "b", name: "Hosting", price: 120, billing_cycle: "yearly", category: "Cloud", next_due_date: inDays(60) }),
  make({ id: "c", name: "Old Gym", price: 40, is_active: false, next_due_date: inDays(2) }),
  make({ id: "d", name: "Spotify EU", price: 10, currency: "EUR", next_due_date: inDays(5) }),
  make({ id: "e", name: "Disney", price: 8 }),
];

const renderDashboard = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <Dashboard />
    </QueryClientProvider>
  );

const summary = () => within(screen.getByRole("region", { name: "Spending summary" }));
// Each figure is a <dt> label followed by its <dd> value.
const figure = (label: string) => summary().getByText(label).nextElementSibling!.textContent;

describe("Dashboard", () => {
  beforeEach(() => {
    Object.values(api).forEach((fn) => fn.mockReset());
    api.fetchSubscriptions.mockResolvedValue(SUBS);
    api.updateSubscription.mockResolvedValue(undefined);
    api.deleteSubscription.mockResolvedValue(undefined);
  });

  it("totals only active subscriptions in the primary currency, normalising yearly plans", async () => {
    renderDashboard();
    await screen.findByRole("heading", { name: "Dashboard" });

    // USD is primary (Netflix 15 + Hosting 120/12 + Disney 8); paused Old Gym and EUR Spotify are excluded.
    expect(summary().getByText("$33.00")).toBeInTheDocument();
    expect(figure("Yearly spend")).toContain("$396.00");
    // 4 active subscriptions (every currency); Netflix (3d) and Spotify EU (5d) fall within a week, paused Old Gym does not.
    expect(figure("Active subscriptions")).toBe("4");
    expect(figure("Due this week")).toBe("2");
    expect(screen.getByText(/1 other active subscription is not included/)).toBeInTheDocument();
  });

  it("keeps paused subscriptions out of upcoming renewals but lists them in the table as paused", async () => {
    renderDashboard();
    await screen.findByRole("heading", { name: "Dashboard" });

    const renewals = screen.getByRole("region", { name: "Upcoming Renewals" });
    expect(within(renewals).getByText("Netflix")).toBeInTheDocument();
    expect(within(renewals).queryByText("Old Gym")).not.toBeInTheDocument();

    const row = screen.getByRole("row", { name: /Old Gym/ });
    expect(within(row).getByText("Paused")).toBeInTheDocument();
  });

  it("places only active charges due within 30 days on the renewal ruler", async () => {
    renderDashboard();
    await screen.findByRole("heading", { name: "Dashboard" });

    // Netflix (3d), Spotify EU (5d) and Disney (30d). Hosting is 60 days out and Old Gym is paused.
    const markers = screen.getAllByRole("button", { name: /, due / });
    expect(markers.map((m) => m.getAttribute("aria-label")?.split(",")[0])).toEqual(["Netflix", "Spotify EU", "Disney"]);
    expect(screen.getByText(/3 charges/)).toBeInTheDocument();
  });

  it("starts new subscriptions in the default currency (INR)", async () => {
    const user = userEvent.setup();
    renderDashboard();
    await screen.findByRole("heading", { name: "Dashboard" });

    await user.click(screen.getByRole("button", { name: "Add subscription" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("combobox", { name: "Currency" })).toHaveTextContent("INR");
  });

  it("marks a subscription as paid from the row menu and rolls its due date forward", async () => {
    const user = userEvent.setup();
    renderDashboard();
    await screen.findByRole("heading", { name: "Dashboard" });

    await user.click(within(screen.getByRole("row", { name: /Netflix/ })).getByRole("button", { name: "Open menu" }));
    await user.click(await screen.findByRole("menuitem", { name: "Mark as paid" }));

    expect(api.updateSubscription).toHaveBeenCalledWith("a", {
      last_paid_at: format(new Date(), "yyyy-MM-dd"),
      next_due_date: format(addMonths(addDays(new Date(), 3), 1), "yyyy-MM-dd"),
    });
  });

  it("marks a renewal as paid from the upcoming list", async () => {
    const user = userEvent.setup();
    renderDashboard();
    await screen.findByRole("heading", { name: "Dashboard" });

    await user.click(screen.getByRole("button", { name: "Mark Netflix as paid" }));
    expect(api.updateSubscription).toHaveBeenCalledWith("a", expect.objectContaining({ last_paid_at: expect.any(String) }));
  });

  it("does not offer Mark as paid for a paused subscription", async () => {
    const user = userEvent.setup();
    renderDashboard();
    await screen.findByRole("heading", { name: "Dashboard" });

    await user.click(within(screen.getByRole("row", { name: /Old Gym/ })).getByRole("button", { name: "Open menu" }));
    await screen.findByRole("menuitem", { name: "Resume" });
    expect(screen.queryByRole("menuitem", { name: "Mark as paid" })).not.toBeInTheDocument();
  });

  describe("logo picker", { timeout: 30000 }, () => {
    const openForm = async () => {
      const user = userEvent.setup();
      renderDashboard();
      await screen.findByRole("heading", { name: "Dashboard" });
      await user.click(screen.getByRole("button", { name: "Add subscription" }));
      const dialog = await screen.findByRole("dialog");
      return { user, dialog, logo: () => within(dialog).getByRole("combobox", { name: "Logo" }) };
    };

    it("starts with no logo and picks one from the typed name", async () => {
      const { user, dialog, logo } = await openForm();
      expect(logo()).toHaveTextContent("No logo");

      const name = within(dialog).getByRole("textbox", { name: "Subscription Name" });
      await user.type(name, "Netflix");
      expect(logo()).toHaveTextContent("Netflix");

      await user.clear(name);
      await user.type(name, "Spotify Family");
      expect(logo()).toHaveTextContent("Spotify");

      await user.clear(name);
      await user.type(name, "Gym membership");
      expect(logo()).toHaveTextContent("No logo");
    });

    it("keeps the user's own choice while the name changes, until they ask to match again", async () => {
      const { user, dialog, logo } = await openForm();
      const name = within(dialog).getByRole("textbox", { name: "Subscription Name" });
      await user.type(name, "Netflix");

      await user.click(logo());
      await user.click(await screen.findByRole("option", { name: "Spotify" }));
      expect(logo()).toHaveTextContent("Spotify");
      expect(within(dialog).getByText("You picked this logo.")).toBeInTheDocument();

      await user.type(name, " Premium");
      expect(logo()).toHaveTextContent("Spotify");

      await user.click(within(dialog).getByRole("button", { name: "Match from name" }));
      expect(logo()).toHaveTextContent("Netflix");
    });

    it("offers the brands grouped by category, with search", async () => {
      const { user, logo } = await openForm();
      await user.click(logo());
      const list = await screen.findByRole("listbox");
      ["Streaming", "Music & audio", "Cloud storage", "Gaming", "AI", "Developer & hosting", "Learning", "Finance & payments", "EMI & pay later", "Banks & cards"].forEach(
        (c) => expect(within(list).getByText(c)).toBeInTheDocument()
      );
      expect(within(list).getByRole("option", { name: "No logo (initials)" })).toBeInTheDocument();
      expect(within(list).getByRole("option", { name: "Netflix" })).toBeInTheDocument();

      await user.type(screen.getByPlaceholderText("Search brands"), "spot");
      expect(within(screen.getByRole("listbox")).getByRole("option", { name: "Spotify" })).toBeInTheDocument();
      expect(within(screen.getByRole("listbox")).queryByRole("option", { name: "Netflix" })).not.toBeInTheDocument();
    });
  });

  it("asks for confirmation before deleting", async () => {
    const user = userEvent.setup();
    renderDashboard();
    await screen.findByRole("heading", { name: "Dashboard" });

    const row = screen.getByRole("row", { name: /Disney/ });
    await user.click(within(row).getByRole("button", { name: "Open menu" }));
    await user.click(await screen.findByRole("menuitem", { name: "Delete" }));

    const dialog = await screen.findByRole("alertdialog");
    expect(dialog).toHaveTextContent("Delete Disney?");
    expect(api.deleteSubscription).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(api.deleteSubscription).not.toHaveBeenCalled();

    await user.click(within(row).getByRole("button", { name: "Open menu" }));
    await user.click(await screen.findByRole("menuitem", { name: "Delete" }));
    await user.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Delete" }));
    expect(api.deleteSubscription).toHaveBeenCalledWith("e");
  });

  it("pauses an active subscription and resumes a paused one", async () => {
    const user = userEvent.setup();
    renderDashboard();
    await screen.findByRole("heading", { name: "Dashboard" });

    await user.click(within(screen.getByRole("row", { name: /Netflix/ })).getByRole("button", { name: "Open menu" }));
    await user.click(await screen.findByRole("menuitem", { name: "Pause" }));
    expect(api.updateSubscription).toHaveBeenLastCalledWith("a", { is_active: false });

    await user.click(within(screen.getByRole("row", { name: /Old Gym/ })).getByRole("button", { name: "Open menu" }));
    await user.click(await screen.findByRole("menuitem", { name: "Resume" }));
    expect(api.updateSubscription).toHaveBeenLastCalledWith("c", { is_active: true });
  });
});
