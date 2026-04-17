import type messages from '../messages/en.json'

/** Keys present in locale JSON (used for dynamic MTR codes, etc.). */
export type MessageKey = keyof typeof messages
