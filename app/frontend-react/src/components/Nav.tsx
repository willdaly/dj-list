import type { SessionState } from '../types/models';

interface NavProps {
  session: SessionState | null;
}

export function Nav({ session }: NavProps) {
  return (
    <nav className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <a
        href="/"
        className="text-xl font-semibold tracking-tight text-gray-900 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
      >
        DJ List
      </a>
      {session?.authenticated ? (
        <form method="POST" action="/logout" className="inline">
          <button
            type="submit"
            className="text-sm text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
          >
            Logout
          </button>
        </form>
      ) : null}
    </nav>
  );
}
