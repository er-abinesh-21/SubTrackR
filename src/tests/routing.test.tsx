import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
      signOut: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    }))
  }
}));

describe('Routing and Redirects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Unauthenticated User', () => {
    beforeEach(() => {
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null }
      });
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: null }
      });
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
    const mockSession = {
      user: {
        id: 'test-user-id',
        email: 'test@example.com'
      },
      access_token: 'test-token'
    };

    beforeEach(() => {
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: mockSession }
      });
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockSession.user }
      });
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
    it('should redirect to login when user signs out', async () => {
      const mockAuthChange = vi.fn();
      (supabase.auth.onAuthStateChange as any).mockImplementation((callback) => {
        mockAuthChange.mockImplementation(callback);
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <App />
        </MemoryRouter>
      );

      // Simulate sign out
      mockAuthChange('SIGNED_OUT', null);

      await waitFor(() => {
        expect(window.location.pathname).toBe('/login');
      });
    });

    it('should redirect to dashboard when user signs in', async () => {
      const mockAuthChange = vi.fn();
      (supabase.auth.onAuthStateChange as any).mockImplementation((callback) => {
        mockAuthChange.mockImplementation(callback);
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      render(
        <MemoryRouter initialEntries={['/login']}>
          <App />
        </MemoryRouter>
      );

      // Simulate sign in
      mockAuthChange('SIGNED_IN', { user: { id: 'test-id', email: 'test@example.com' } });

      await waitFor(() => {
        expect(window.location.pathname).toBe('/dashboard');
      });
    });
  });
});
