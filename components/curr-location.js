import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import styled from 'styled-components';
import { useTheme } from '~/theme';

const Container = styled(motion.div)`
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const button = {
  rest: { scale: 1.3 },
  hover: { scale: 1.5 },
  pressed: { scale: 1.1 },
};

const CurrLocation = ({ onClick }) => {
  const { colors } = useTheme();
  const controls = useAnimation();
  const [count, setCount] = useState(0);
  const onClickButton = () => {
    onClick();
    setCount(prev => prev + 1);
  }

  useEffect(() => {
    if(count > 0) {
      controls.start("click");
    }
  }, [count])
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
        animate={controls} fill={colors.text} fillRule="nonzero"
      >
        <path d="M0 0h24v24H0V0z" fill="none"/>
        <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
      </motion.svg>
    </Container>
  );
};

export default React.memo(CurrLocation);
