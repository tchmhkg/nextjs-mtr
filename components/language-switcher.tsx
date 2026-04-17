'use client'

import { usePathname, useRouter } from '@i18n/navigation'
import { routing } from '@i18n/routing'
import { SUPPORTED_LOCALES } from '@utils/locale-path'
import { useLocale, useTranslations } from 'next-intl'
import React, { useCallback } from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`

const LocaleButton = styled.div<{ $selected: boolean }>`
  cursor: pointer;
  color: ${(props) => (props.$selected ? '#ffffff' : props.theme.text)};
  display: flex;
  justify-content: center;
  margin: 0 5px;
  border-radius: 20px;
  padding: 4px 8px;
  font-size: 14px;
  background: ${({ $selected, theme }) =>
    $selected ? theme.primary1 : 'transparent'};
  background: ${({ $selected, theme }) =>
    $selected
      ? `-webkit-linear-gradient(to right, ${theme.primary2}, ${theme.primary1})`
      : 'transparent'};
  background: ${({ $selected, theme }) =>
    $selected
      ? `linear-gradient(to right, ${theme.primary2}, ${theme.primary1})`
      : 'transparent'};
  @media (max-width: 374px) {
    font-size: 12px;
  }
`

type AppLocale = (typeof routing.locales)[number]

const LanguageSwitcher = () => {
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = useLocale()
  const t = useTranslations()

  const handleLocaleChange = useCallback(
    (nextLocale: AppLocale) => {
      if (currentLocale === nextLocale) return
      router.replace(pathname, { locale: nextLocale })
    },
    [currentLocale, router, pathname]
  )

  return (
    <Wrapper>
      {SUPPORTED_LOCALES.map((lng) => (
        <LocaleButton
          key={lng}
          $selected={lng === currentLocale}
          onClick={() => handleLocaleChange(lng)}
        >
          {t(lng)}
        </LocaleButton>
      ))}
    </Wrapper>
  )
}

export default React.memo(LanguageSwitcher)
