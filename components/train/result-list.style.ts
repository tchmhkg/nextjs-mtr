import styled from 'styled-components'

interface IWrapper {
  left?: boolean
  right?: boolean
}

export const ListWrapper = styled.div`
  overflow: auto;
  padding: 5px 0;

  .list-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 8px 0;
    background: ${({ theme }) => theme.backgroundAlt};
    border-radius: 8px;
    padding: 4px 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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
      text-align: right;
      .time-text {
        font-size: 18px;
        font-weight: bold;
      }
      .time-diff {
        font-size: 14px;
      }
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
  .label {
    font-weight: bold;
  }
  @media (min-width: 769px) {
    margin-left: ${({ right }) => (right ? '3px' : 0)};
    margin-right: ${({ left }) => (left ? '3px' : 0)};
  }
`
