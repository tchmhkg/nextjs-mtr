import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ fontFamily: 'system-ui', padding: 24 }}>
      <h1>404</h1>
      <p>This page could not be found.</p>
      <Link href="/">Back to home</Link>
    </div>
  )
}
