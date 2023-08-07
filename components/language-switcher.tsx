import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
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
  padding: 5px 10px;
  font-size: 18px;
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
    font-size: 16px;
  }
`

const LanguageSwitcher = ({ inNavbar = false }) => {
  const router = useRouter()

  const { i18n, t } = useTranslation()
  const handleLocaleChange = useCallback(
    (locale: string) => {
      if (i18n.language === locale) return
      i18n.changeLanguage(locale)

      router.push(
        {
          pathname: router.pathname + '/' + locale,
          query: router.query,
        },
        null,
        { locale: locale }
      )
    },
    [i18n, router]
  )

  return (
    <Wrapper inNavbar={inNavbar}>
      {router.locales?.map((locale) => (
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
