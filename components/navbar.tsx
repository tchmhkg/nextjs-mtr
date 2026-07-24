'use client'

import LanguageSwitcher from '@components/language-switcher'
import ThemeSwitcher from '@components/theme-switcher'
import { CLIENT_GITHUB_URL } from '@lib/public-env'
import Image from 'next/image'
import { memo } from 'react'
import styled from 'styled-components'

interface IContainer {
  shouldUpdateZIndex?: boolean
}

const Container = styled.div<IContainer>`
  position: fixed;
  width: 100vw;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: calc(50px + env(safe-area-inset-top, 0px));
  padding-top: env(safe-area-inset-top, 0px);
  padding-right: calc(15px + env(safe-area-inset-right, 0px));
  -webkit-transition: background-color 200ms linear;
  -ms-transition: background-color 200ms linear;
  transition: background-color 200ms linear;
  /* Above NProgress bar (z-index ~1031) so the bar never covers controls */
  z-index: ${({ shouldUpdateZIndex }) => (shouldUpdateZIndex ? 1100 : 1090)};
`

const RightWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`
const GitHubIconWrapper = styled.div`
  background-color: #ffffff;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  @media (max-width: 374px) {
    margin-right: 15px;
  }
`

const GitHubButton = memo(function GitHubButton() {
  if (!CLIENT_GITHUB_URL) return null
  return (
    <GitHubIconWrapper>
      <a href={CLIENT_GITHUB_URL} rel="noopener noreferrer" target="_blank">
        <Image
          src="/images/github.png"
          width={25}
          height={25}
          alt="GitHub Icon"
          priority
        />
      </a>
    </GitHubIconWrapper>
  )
})

const Header = () => {
  return (
    <Container>
      <RightWrapper>
        <GitHubButton />
        <LanguageSwitcher />
        <ThemeSwitcher />
      </RightWrapper>
    </Container>
  )
}

export default memo(Header)
