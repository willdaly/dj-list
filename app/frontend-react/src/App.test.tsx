import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('renders the React foundation shell', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'DJ List' })).toBeInTheDocument();
  });
});
