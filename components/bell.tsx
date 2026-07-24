'use client'

import { useTranslations } from 'next-intl'
import React, { useCallback, useState } from 'react'

interface BellProps {
  onClick: () => void
}

function Bell({ onClick }: BellProps) {
  const t = useTranslations()
  const [pulse, setPulse] = useState(false)
  const onClickButton = useCallback(() => {
    onClick()
    setPulse(true)
    window.setTimeout(() => setPulse(false), 350)
  }, [onClick])

  return (
    <button
      type="button"
      onClick={onClickButton}
      aria-label={t('Alert')}
      className="flex size-11 items-center justify-center text-ink transition-transform hover:scale-110"
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
        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6zM7.58 4.08L6.15 2.65C3.75 4.48 2.17 7.3 2.03 10.5h2c.15-2.65 1.51-4.97 3.55-6.42zm12.39 6.42h2c-.15-3.2-1.73-6.02-4.12-7.85l-1.42 1.43c2.02 1.45 3.39 3.77 3.54 6.42z" />
      </svg>
    </button>
  )
}

export default React.memo(Bell)
