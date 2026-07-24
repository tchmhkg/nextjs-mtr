'use client'

import { CLIENT_GITHUB_URL } from '@lib/public-env'
import LanguageSwitcher from '@components/language-switcher'
import ThemeSwitcher from '@components/theme-switcher'
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

function Header() {
  return (
    <header className="fixed left-0 top-0 z-[1090] flex h-[calc(50px+env(safe-area-inset-top,0px))] w-screen items-center justify-end pt-[env(safe-area-inset-top,0px)] pr-[calc(15px+env(safe-area-inset-right,0px))]">
      <div className="flex items-center gap-1">
        <GitHubButton />
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>
    </header>
  )
}

export default memo(Header)
