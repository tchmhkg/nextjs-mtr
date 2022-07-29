import styled from 'styled-components'

interface ILeft {
  bgColor?: string
}
interface IOption {
  color?: string
  selected: boolean
}
interface IRelatedLine {
  lineColor: string
}

export const Heading = styled.h2`
  color: ${(props) => props.theme.text};
  margin: 0;
`

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 18px;
  @media (max-width: 374px) {
    font-size: 16px;
  }
`

export const SelectorWrapper = styled.div`
  display: flex;
  flex-direction: row;
  border-radius: 8px;
  overflow: hidden;
`

export const Left = styled.div<ILeft>`
  flex: 1;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 170px;
  overflow-y: auto;
  margin-right: 3px;
`
export const Right = styled(Left)`
  background: ${({ bgColor }) => bgColor || 'transparent'};
  border-radius: 8px;
  margin-left: 3px;
  margin-right: 0;
`

export const Option = styled.div<IOption>`
  cursor: pointer;
  display: flex;
  align-items: center;
  .option-name {
    background: ${({ color, selected }) =>
      selected ? `${color}` : 'transparent'};
    color: ${({ selected, theme }) => (selected ? '#fff' : theme.text)};
    width: 100%;
    padding: 3px;
  }
`

export const LineOption = styled(Option)`
  .option-name {
    border-radius: 8px;
  }
`

export const StationOption = styled(Option)`
  background: ${({ color }) => color};
  padding: 3px;
  .option-name {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    background: ${({ selected }) =>
      selected ? '#fff' : 'transparent'} !important;
    color: ${({ selected }) => (selected ? '#000' : '#fff')} !important;
    border-radius: 8px;
    .more-option {
      font-size: 18px;
      cursor: pointer;
      padding: 0 8px;
    }
  }
`

export const LineColor = styled.div`
  width: 18px;
  height: 5px;
  background-color: ${({ color }) => color};
  border-radius: 5px;
  margin: 0 5px;
`

export const RelatedLineWrapper = styled.div``

export const RelatedLine = styled.div<IRelatedLine>`
  cursor: pointer;
  border-radius: 8px;
  background-color: ${({ lineColor }) => lineColor};
  color: #ffffff;
  padding: 3px;
`
