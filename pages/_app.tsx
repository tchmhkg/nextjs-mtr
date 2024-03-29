import { store } from '@store/store'
import '@styles/global.scss'
import type { AppProps } from 'next/app'
import Router from 'next/router'
import NProgress from 'nprogress'

import ThemeManager from '@theme/theme'
import { LayoutGroup } from 'framer-motion'
import { appWithTranslation } from 'next-i18next'
import { Provider } from 'react-redux'

Router.events.on('routeChangeStart', () => NProgress.start())
Router.events.on('routeChangeComplete', () => NProgress.done())
Router.events.on('routeChangeError', () => NProgress.done())

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <Provider store={store}>
      <LayoutGroup>
        <ThemeManager>
          <Component {...pageProps} />
        </ThemeManager>
      </LayoutGroup>
    </Provider>
  )
}

export default appWithTranslation(App)
