import styled from 'styled-components'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
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
`

export const LastUpdate = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 14px;
  .last-update-time {
    margin-right: 10px;
  }
`
