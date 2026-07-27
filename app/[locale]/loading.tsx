import Layout from '@components/layout'

export default function Loading() {
  return (
    <Layout home>
      <div className="animate-pulse space-y-4" aria-hidden>
        <div className="h-8 w-48 rounded bg-border/60" />
        <div className="h-10 w-full rounded bg-border/40" />
        <div className="h-40 w-full rounded bg-border/40" />
      </div>
    </Layout>
  )
}
