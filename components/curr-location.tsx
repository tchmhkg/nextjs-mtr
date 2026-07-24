'use client'

import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

interface CurrLocationProps {
  onClick: () => void
  'aria-label': string
  busy?: boolean
}

function CurrLocation({
  onClick,
  'aria-label': ariaLabel,
  busy = false,
}: CurrLocationProps) {
  const [pulse, setPulse] = useState(false)
  const onClickButton = () => {
    if (busy) return
    onClick()
    setPulse(true)
    window.setTimeout(() => setPulse(false), 350)
  }

  return (
    <button
      type="button"
      onClick={onClickButton}
      aria-label={ariaLabel}
      aria-busy={busy}
      disabled={busy}
      className="flex size-11 items-center justify-center rounded-lg text-ink transition-transform hover:scale-110 disabled:cursor-wait disabled:opacity-60"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        fillRule="nonzero"
        aria-hidden
        className={pulse ? 'scale-110 transition-transform' : ''}
      >
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
      </svg>
    </button>
  )
}

export default React.memo(CurrLocation)
