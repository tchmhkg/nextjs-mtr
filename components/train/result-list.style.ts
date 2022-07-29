import styled from 'styled-components'

interface IWrapper {
  left?: boolean
  right?: boolean
}

export const ListWrapper = styled.div`
  height: 160px;
  overflow: auto;
  padding: 5px 0;

  .list-item {
    display: flex;
    justify-content: space-between;
    margin: 3px 0;
    &:not(:last-child) {
      border-bottom: 1px solid ${({ theme }) => theme.border};
      padding: 3px 0;
    }
    &:hover {
      font-weight: bold;
    }
    .item-dest {
      flex: 0.7;
      @media (max-width: 374px) {
        flex: 0.6;
      }
    }
    .item-time {
      flex: 1;
    }
    @media (max-width: 374px) {
      font-size: 15px;
    }
  }
`

export const Wrapper = styled.div<IWrapper>`
  flex: 1;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-bottom: 5px;
  margin-left: ${({ right }) => (right ? '3px' : 0)};
  margin-right: ${({ left }) => (left ? '3px' : 0)};
`
