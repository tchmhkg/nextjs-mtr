import { store } from '@store/store'
import '@styles/global.scss'
import type { AppProps } from 'next/app'
import Router from 'next/router'
import NProgress from 'nprogress'

import { LanguageProvider } from "@context/LanguageContext"
import "@styles/global.scss"
import ThemeManager from '@theme/theme'
import { LayoutGroup } from "framer-motion"
import { Provider } from "react-redux"

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());


const App = ({ Component, pageProps }: AppProps) => {
  return (
    <Provider store={store}>
      <LayoutGroup>
        <ThemeManager>
          <LanguageProvider lang={pageProps.localization?.locale}>
            <Component {...pageProps} />
          </LanguageProvider>
        </ThemeManager>
      </LayoutGroup>
    </Provider>
  )
}

export default App
