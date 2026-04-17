'use client'

import { localizedPath } from '@utils/locale-path'
import { useRouter } from 'next/navigation'
import { useT } from 'next-i18next/client'
import React, { useCallback } from 'react'
import styled from 'styled-components'

const Button = styled.a`
  cursor: pointer;
  color: ${(props) => props.theme.text};
`

const BackButton = ({ backUrl = '' }) => {
  const { i18n, t } = useT()
  const router = useRouter()
  const onClickBack = useCallback(() => {
    if (backUrl) {
      router.push(localizedPath(i18n.language, backUrl))
    } else {
      router.back()
    }
  }, [router, backUrl, i18n.language])

  return (
    <div>
      <Button onClick={onClickBack}>← {t('Back')}</Button>
    </div>
  )
}

export default React.memo(BackButton)
