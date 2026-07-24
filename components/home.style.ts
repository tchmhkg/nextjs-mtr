import styled from 'styled-components'

interface IOption {
  $color?: string
  $selected: boolean
}
interface IRelatedLine {
  $lineColor: string
}

export const Heading = styled.h1`
  font-family: var(--font-outfit), var(--font-noto-sans-tc), sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: ${(props) => props.theme.text};
  margin: 0;
`

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
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
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  background: ${({ theme }) => theme.backgroundAlt};
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid ${({ theme }) => theme.border};
`

export const PickerRow = styled.div`
  display: flex;
  flex-direction: row;
  min-height: 0;
`

export const PickerPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`

export const MobileBackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.backgroundAlt};
  color: ${({ theme }) => theme.text};
  font-size: 15px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  @media (min-width: 769px) {
    display: none;
  }
`

export const Left = styled.div`
  flex: 1;
  justify-content: flex-start;
  align-items: stretch;
  flex-direction: column;
  height: 280px;
  overflow-y: auto;
  padding: 6px;
  @media (max-width: 768px) {
    height: min(52vh, 360px);
    width: 100%;
  }
`

export const Right = styled(Left)<{ $bgColor?: string }>`
  background: ${({ $bgColor }) => $bgColor || 'transparent'};
  border-radius: 0 12px 12px 0;
  @media (max-width: 768px) {
    border-radius: 0 0 12px 12px;
  }
  @media (min-width: 769px) {
    border-left: 1px solid rgba(255, 255, 255, 0.15);
  }
`

export const Option = styled.div<IOption>`
  cursor: pointer;
  display: flex;
  align-items: center;
  min-height: 48px;
  .option-name {
    background: ${({ $color, $selected }) =>
    $selected ? `${$color}` : 'transparent'};
    color: ${({ $selected, theme }) => ($selected ? '#fff' : theme.text)};
    width: 100%;
    padding: 12px 10px;
    min-height: 48px;
    display: flex;
    align-items: center;
    font-weight: ${({ $selected }) => ($selected ? 600 : 400)};
    transition: background-color 0.15s ease;
  }
`

export const LineOption = styled(Option)`
  .option-name {
    border-radius: 10px;
  }
`

export const StationOption = styled(Option)`
  background: ${({ $color }) => $color};
  padding: 4px;
  min-height: 48px;
  border-radius: 10px;
  .option-name {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    background: ${({ $selected }) =>
    $selected ? '#fff' : 'transparent'} !important;
    color: ${({ $selected }) => ($selected ? '#000' : '#fff')} !important;
    border-radius: 8px;
    .more-option {
      font-size: 18px;
      cursor: pointer;
      min-width: 44px;
      min-height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 8px;
      color: ${({ $selected }) => ($selected ? '#000' : '#fff')} !important;
    }
  }
`

export const LineColor = styled.div<{ $color: string }>`
  width: 20px;
  height: 6px;
  background-color: ${({ $color }) => $color};
  border-radius: 4px;
  margin: 0 8px;
  flex-shrink: 0;
`

export const RelatedLineWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const RelatedLine = styled.button<IRelatedLine>`
  cursor: pointer;
  border: none;
  border-radius: 10px;
  background-color: ${({ $lineColor }) => $lineColor};
  color: #ffffff;
  padding: 12px;
  min-height: 48px;
  font-size: 16px;
  font-family: inherit;
  text-align: left;
`

export const ShowMoreButton = styled.button`
  background: none;
  border: none;
  outline: none;
  box-shadow: none;
`

export const LocationMessage = styled.p`
  margin: 8px 0 0;
  font-size: 14px;
  color: ${({ theme }) => theme.leaving};
`
