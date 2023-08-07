import { useTranslation } from 'next-i18next'
import styled from 'styled-components'

const AlertButton = styled.button`
  appearance: none;
  border: none;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 10px 20px;
  cursor: pointer;
  text-align: center;
  border-radius: 8px;
  font-size: 18px;
  margin-top: 16px;
  width: max-content;
  align-self: center;
  &:hover: {
    opacity: 0.7;
  }
`

const AlertContent = styled.div`
  max-width: 500px;
  width: 100%;
  ${'' /* margin: 15px; */}
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px;
  position: fixed;
  top: 50vh;
  left: 50vw;
  transform: translate(-50%, -50%);
  background-color: #ffffff;
  border-radius: 15px;
  z-index: 1000;
`

const AlertContainer = styled.div`
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
`

const Alert = ({ children, onPressClose }) => {
  const { t } = useTranslation()
  return (
    <AlertContainer>
      <AlertContent>
        {children}
        <AlertButton onClick={onPressClose}>{t('close')}</AlertButton>
      </AlertContent>
    </AlertContainer>
  )
}

export default Alert
