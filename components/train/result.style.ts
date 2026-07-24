import styled, { css, keyframes } from 'styled-components'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;

  .delay-banner,
  .stale-error {
    margin-bottom: 8px;
    font-size: 14px;
  }

  .stale-error button {
    margin-left: 8px;
    cursor: pointer;
  }
`

export const ResultWrapper = styled(Wrapper)`
  @media (min-width: 769px) {
    flex-direction: row;
  }
`

export const Header = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin: 10px 0;
  gap: 8px;
`

const flashBg = keyframes`
  from { background-color: rgba(82, 196, 26, 0.28); }
  to { background-color: transparent; }
`

export const LastUpdate = styled.div<{ $flash?: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 14px;
  border-radius: 6px;
  padding: 2px 4px;
  ${(p) =>
    p.$flash &&
    css`
      animation: ${flashBg} 0.6s ease-out;
    `}
  .last-update-time {
    margin-right: 10px;
  }
  .refreshing-hint {
    opacity: 0.7;
  }
`
