import { routing } from './i18n/routing'
import messages from './messages/en.json'

declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number]
    Messages: typeof messages
  }
}

/** Marker type so this file remains a valid ES module for `declare module` augmentation. */
export type NextIntlAppAugmentation = void
