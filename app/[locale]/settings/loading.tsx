import Layout from '@components/layout'

export default function SettingsLoading() {
  return (
    <Layout>
      <div className="animate-pulse space-y-4" aria-hidden>
        <div className="h-8 w-40 rounded bg-border/60" />
        <div className="h-12 w-full rounded bg-border/40" />
        <div className="h-12 w-full rounded bg-border/40" />
        <div className="h-12 w-full rounded bg-border/40" />
      </div>
    </Layout>
  )
}
