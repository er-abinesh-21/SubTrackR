import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

// Mock Firebase Auth
const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
};

let mockAuthUser: typeof mockUser | null = null;
let mockAuthLoading = false;
const mockSignIn = vi.fn();
const mockSignUp = vi.fn();
const mockSignInWithGoogle = vi.fn();
const mockSignOut = vi.fn();
const mockResetPassword = vi.fn();

vi.mock('@/integrations/firebase/auth', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    user: mockAuthUser,
    loading: mockAuthLoading,
    signIn: mockSignIn,
    signUp: mockSignUp,
    signInWithGoogle: mockSignInWithGoogle,
    signOut: mockSignOut,
    resetPassword: mockResetPassword,
  }),
}));

// Mock Firebase subscriptions service
vi.mock('@/integrations/firebase/subscriptions', () => ({
  fetchSubscriptions: vi.fn(() => Promise.resolve([])),
  addSubscription: vi.fn(),
  updateSubscription: vi.fn(),
  deleteSubscription: vi.fn(),
}));

describe('Routing and Redirects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthUser = null;
    mockAuthLoading = false;
  });

  describe('Unauthenticated User', () => {
    beforeEach(() => {
      mockAuthUser = null;
      mockAuthLoading = false;
    });

    it('should redirect from / to /login when not authenticated', async () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(window.location.pathname).toBe('/login');
      }, { timeout: 3000 });
    });

    it('should show login page at /login', async () => {
      render(
        <MemoryRouter initialEntries={['/login']}>
          <App />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Welcome to SubTrackR/i)).toBeInTheDocument();
      });
    });

    it('should redirect from /dashboard to /login when not authenticated', async () => {
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <App />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(window.location.pathname).toBe('/login');
      }, { timeout: 3000 });
    });

    it('should show 404 page for unknown routes', async () => {
      render(
        <MemoryRouter initialEntries={['/unknown-route']}>
          <App />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('404')).toBeInTheDocument();
        expect(screen.getByText(/Page not found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Authenticated User', () => {
    beforeEach(() => {
      mockAuthUser = mockUser;
      mockAuthLoading = false;
    });

    it('should redirect from / to /dashboard when authenticated', async () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(window.location.pathname).toBe('/dashboard');
      }, { timeout: 3000 });
    });

    it('should redirect from /login to /dashboard when authenticated', async () => {
      render(
        <MemoryRouter initialEntries={['/login']}>
          <App />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(window.location.pathname).toBe('/dashboard');
      }, { timeout: 3000 });
    });

    it('should show dashboard at /dashboard when authenticated', async () => {
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <App />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });
    });

    it('should show 404 page with home link for unknown routes', async () => {
      render(
        <MemoryRouter initialEntries={['/unknown-route']}>
          <App />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('404')).toBeInTheDocument();
        expect(screen.getByText('Return to Home')).toBeInTheDocument();
      });
    });
  });

  describe('Auth State Changes', () => {
    it('should show login when user is not authenticated', async () => {
      mockAuthUser = null;
      mockAuthLoading = false;

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <App />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(window.location.pathname).toBe('/login');
      });
    });

    it('should show dashboard when user is authenticated', async () => {
      mockAuthUser = mockUser;
      mockAuthLoading = false;

      render(
        <MemoryRouter initialEntries={['/login']}>
          <App />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(window.location.pathname).toBe('/dashboard');
      });
    });
  });
});
