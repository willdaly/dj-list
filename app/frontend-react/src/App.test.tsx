import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('renders signed-out shell based on session endpoint', async () => {
    const response = {
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ authenticated: false, user: null })
    } as unknown as Response;

    global.fetch = vi.fn(() => Promise.resolve(response)) as unknown as typeof fetch;

    render(<App />);
    expect(screen.getByRole('heading', { name: 'DJ List' })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: 'Sign In with Spotify' })).toBeInTheDocument();
  });
});
