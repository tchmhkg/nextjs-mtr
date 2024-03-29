import dynamic from 'next/dynamic'
import { memo } from 'react'
import styled from 'styled-components'
// import Menu from "@components/menu";
const LanguageSwitcher = dynamic(import('@components/language-switcher'))
const ThemeSwitcher = dynamic(import('@components/theme-switcher'))
const Image = dynamic(import('next/image'))

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
  height: 70px;
  background-color: ${(props) => props.theme.background};
  -webkit-transition: background-color 200ms linear;
  -ms-transition: background-color 200ms linear;
  transition: background-color 200ms linear;
  z-index: ${({ shouldUpdateZIndex }) => (shouldUpdateZIndex ? 20 : 15)};
  @media (min-width: 768px) {
    padding-right: 15px;
  }
`

const RightWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`
const GitHubIconWrapper = styled.div`
  background-color: #ffffff;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  @media (max-width: 374px) {
    margin-right: 15px;
  }
`

const GitHubButton = memo(() => (
  <GitHubIconWrapper>
    <a
      href="https://github.com/tchmhkg/nextjs-mtr"
      rel="noopener noreferrer"
      target="_blank"
    >
      <Image
        src="/images/github.png"
        width={30}
        height={30}
        alt="GitHub Icon"
      />
    </a>
  </GitHubIconWrapper>
))

GitHubButton.displayName = 'GitHubButton'

const Header = () => {
  return (
    <Container>
      <RightWrapper>
        <GitHubButton />
        <LanguageSwitcher inNavbar />
        <ThemeSwitcher inNavbar />
      </RightWrapper>
    </Container>
  )
}

export default memo(Header)
