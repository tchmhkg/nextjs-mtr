'use client'

import { useRouter } from '@i18n/navigation'
import { localizedPath } from '@utils/locale-path'
import { useLocale, useTranslations } from 'next-intl'
import React, { useCallback } from 'react'
import styled from 'styled-components'

const Button = styled.a`
  cursor: pointer;
  color: ${(props) => props.theme.text};
`

const BackButton = ({ backUrl = '' }) => {
  const locale = useLocale()
  const t = useTranslations()
  const router = useRouter()
  const onClickBack = useCallback(() => {
    if (backUrl) {
      router.push(localizedPath(locale, backUrl))
    } else {
      router.back()
    }
  }, [router, backUrl, locale])

  return (
    <div>
      <Button onClick={onClickBack}>← {t('Back')}</Button>
    </div>
  )
}

export default React.memo(BackButton)
