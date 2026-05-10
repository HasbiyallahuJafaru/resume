import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full border-b border-surface-3 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-7 w-7 rounded-lg bg-ink flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-ink tracking-tight">
            {process.env.NEXT_PUBLIC_APP_NAME ?? "ResumeForge"}
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/app"
            className="text-sm font-medium bg-ink text-white px-4 py-1.5 rounded-lg hover:bg-ink-secondary transition-colors duration-150"
          >
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  );
}
