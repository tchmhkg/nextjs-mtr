import dynamic from 'next/dynamic';
import styled from 'styled-components';
import styles from "~/components/layout.module.scss";
import useTranslation from '~/hooks/useTranslation'

const Head = dynamic(import('~/components/head'));
const Navbar = dynamic(import('~/components/navbar'));
const BackButton = dynamic(import('~/components/back'));
const Link = dynamic(import('next/link'));

const Container = styled.div`
  overflow-y: auto;
  height: calc(100% - 70px);
  top: 70px;
  padding: 15px;
  position: relative;
  color: ${props => props.theme.text};
  a {
    color: ${props => props.theme.text};
  };
`;

const Layout = ({ children, home, showAvatar = true, back = false, showBackToHome = true, ...props }) => {
  const { locale, t } = useTranslation();

  return (
    <>
    <Navbar />
    <Container>
      <Head />
      {back && <BackButton backUrl={props.backUrl}/>}
      <main>{children}</main>
      {(!home && showBackToHome) && (
        <div className={styles.backToHome}>
          <Link href="/[lang]" as={`/${locale}`}>
            <a>← {t('Back to home')}</a>
          </Link>
        </div>
      )}
    </Container>
    </>
  );
};

export default Layout;
