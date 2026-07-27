export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-6 text-center text-ink">
      <h1 className="text-2xl font-semibold">404</h1>
      <p className="text-muted">This page could not be found.</p>
      <a href="/" className="mt-2 text-sm text-accent underline">
        ← Back to home
      </a>
    </div>
  )
}
