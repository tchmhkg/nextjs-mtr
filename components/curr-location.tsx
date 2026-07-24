'use client'

import { useTheme } from '@theme/theme'
import React, { useState } from 'react'
import styled, { css, keyframes } from 'styled-components'

interface CurrLocationProps {
  onClick: () => void
  'aria-label': string
  busy?: boolean
}

const tapPulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.12);
  }
  100% {
    transform: scale(1);
  }
`

const Button = styled.button`
  width: 44px;
  height: 44px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(1.1);
  transition: transform 0.12s ease-out;
  &:hover:not(:disabled) {
    transform: scale(1.25);
  }
  &:active:not(:disabled) {
    transform: scale(1);
  }
  &:disabled {
    cursor: wait;
    opacity: 0.6;
  }
`

const IconSvg = styled.svg<{ $animate: boolean }>`
  ${(p) =>
    p.$animate &&
    css`
      animation: ${tapPulse} 0.35s ease-out;
    `}
`

const CurrLocation = ({
  onClick,
  'aria-label': ariaLabel,
  busy = false,
}: CurrLocationProps) => {
  const { colors } = useTheme()
  const [count, setCount] = useState(0)
  const onClickButton = () => {
    if (busy) return
    onClick()
    setCount((prev) => prev + 1)
  }

  return (
    <Button
      type="button"
      onClick={onClickButton}
      aria-label={ariaLabel}
      aria-busy={busy}
      disabled={busy}
    >
      <IconSvg
        key={count}
        $animate={count > 0}
        width="18"
        height="18"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        fill={colors.text}
        fillRule="nonzero"
        aria-hidden="true"
      >
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
      </IconSvg>
    </Button>
  )
}

export default React.memo(CurrLocation)
