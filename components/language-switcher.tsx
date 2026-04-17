'use client'

import { SUPPORTED_LOCALES, localizedPath } from '@utils/locale-path'
import { usePathname, useRouter } from 'next/navigation'
import { useT } from 'next-i18next/client'
import React, { useCallback } from 'react'
import styled from 'styled-components'

interface IWrapper {
  inNavbar: boolean
}
interface ILocaleButton {
  selected: boolean
}

const Wrapper = styled.div<IWrapper>`
  display: flex;
  align-items: center;
`

const LocaleButton = styled.div<ILocaleButton>`
  cursor: pointer;
  color: ${(props) => (props.selected ? '#ffffff' : props.theme.text)};
  display: flex;
  justify-content: center;
  margin: 0 5px;
  border-radius: 20px;
  padding: 4px 8px;
  font-size: 14px;
  background: ${({ selected, theme }) =>
    selected ? theme.primary1 : 'transparent'};
  background: ${({ selected, theme }) =>
    selected
      ? `-webkit-linear-gradient(to right, ${theme.primary2}, ${theme.primary1})`
      : 'transparent'};
  background: ${({ selected, theme }) =>
    selected
      ? `linear-gradient(to right, ${theme.primary2}, ${theme.primary1})`
      : 'transparent'};
  @media (max-width: 374px) {
    font-size: 12px;
  }
`

const LanguageSwitcher = ({ inNavbar = false }) => {
  const router = useRouter()
  const pathname = usePathname()
  const { i18n, t } = useT()

  const handleLocaleChange = useCallback(
    (locale: string) => {
      if (i18n.language === locale) return
      router.push(localizedPath(locale, pathname))
    },
    [i18n.language, router, pathname]
  )

  return (
    <Wrapper inNavbar={inNavbar}>
      {SUPPORTED_LOCALES.map((locale) => (
        <LocaleButton
          key={locale}
          selected={locale === i18n.language}
          onClick={() => handleLocaleChange(locale)}
        >
          {t(locale)}
        </LocaleButton>
      ))}
    </Wrapper>
  )
}

export default React.memo(LanguageSwitcher)
