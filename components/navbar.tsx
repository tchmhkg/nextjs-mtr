'use client'

import { Link } from '@i18n/navigation'
import { CLIENT_GITHUB_URL } from '@lib/public-env'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { memo } from 'react'

const GitHubButton = memo(function GitHubButton() {
  if (!CLIENT_GITHUB_URL) return null
  return (
    <a
      href={CLIENT_GITHUB_URL}
      rel="noopener noreferrer"
      target="_blank"
      className="block size-[25px] overflow-hidden rounded-full bg-white"
    >
      <Image
        src="/images/github.png"
        width={25}
        height={25}
        alt="GitHub Icon"
        priority
      />
    </a>
  )
})

const SettingsButton = memo(function SettingsButton() {
  const t = useTranslations()
  return (
    <Link
      href="/settings"
      aria-label={t('Settings')}
      className="flex size-[28px] items-center justify-center text-ink no-underline hover:no-underline"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
        aria-hidden
      >
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    </Link>
  )
})

function Header() {
  return (
    <header className="fixed left-0 top-0 z-[1090] flex h-[calc(50px+env(safe-area-inset-top,0px))] w-screen items-center justify-between pt-[env(safe-area-inset-top,0px)] pl-[calc(15px+env(safe-area-inset-left,0px))] pr-[calc(15px+env(safe-area-inset-right,0px))]">
      <SettingsButton />
      <div className="flex items-center gap-1">
        <GitHubButton />
      </div>
    </header>
  )
}

export default memo(Header)
