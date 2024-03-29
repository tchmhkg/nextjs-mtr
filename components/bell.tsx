import { useTheme } from '@theme/theme'
import { motion, useAnimation } from 'framer-motion'
import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

const Container = styled(motion.div)`
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`

const button = {
  rest: { scale: 1.3 },
  hover: { scale: 1.5 },
  pressed: { scale: 1.1 },
}

const Bell = ({ onClick }) => {
  const { colors } = useTheme()
  const controls = useAnimation()
  const [count, setCount] = useState(0)
  const onClickButton = useCallback(() => {
    onClick()
    setCount((prev) => prev + 1)
  }, [onClick])

  useEffect(() => {
    if (count > 0) {
      controls.start('click')
    }
  }, [controls, count])
  return (
    <Container
      onClick={onClickButton}
      variants={button}
      initial="rest"
      whileHover="hover"
      whileTap="pressed"
    >
      <motion.svg
        key={count}
        width="18"
        height="18"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        animate={controls}
        fill={colors.text}
        fillRule="nonzero"
      >
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6zM7.58 4.08L6.15 2.65C3.75 4.48 2.17 7.3 2.03 10.5h2c.15-2.65 1.51-4.97 3.55-6.42zm12.39 6.42h2c-.15-3.2-1.73-6.02-4.12-7.85l-1.42 1.43c2.02 1.45 3.39 3.77 3.54 6.42z" />
      </motion.svg>
    </Container>
  )
}

export default React.memo(Bell)
