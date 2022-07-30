import styled from 'styled-components'

interface IPlatForm {
  lineColor: string
}

export const PlatFormWrapper = styled.div`
  color: ${({ theme }) => theme.text};
  align-items: center;
  flex: 0.4;
`

export const PlatForm = styled.span<IPlatForm>`
  border-radius: 50%;
  display: inline-flex;
  width: 23px;
  height: 23px;
  font-size: 16px;
  align-items: center;
  justify-content: center;
  color: ${({ lineColor, theme }) => (lineColor ? '#fff' : theme.platformText)};
  background-color: ${({ lineColor, theme }) =>
    lineColor ? lineColor : theme.platformBackground};
  margin-left: 5px;
`
