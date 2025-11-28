export enum STORAGE_TYPE {
  MMKV = 'mmkv',
  ASYNC = 'async'
}

// Altere aqui para mudar o mecanismo de armazenamento
export const CURRENT_STORAGE_TYPE = STORAGE_TYPE.MMKV
export const STORAGE_ID = '@kandengue_pro:storage' // Criptografado
export const ZUSTAND_STORAGE_ID = '@kandengue_pro:zustand' // Apenas para persistência do Zustand

// kandengue-app-settings
export const APP_SETTINGS_STORAGE_ID = '@kandengue_pro:app-settings'
// kandengue-driver
export const PERMISSIONS_DRIVER_STORAGE_ID = '@kandengue_pro:driver'
// kandengue-permissions
export const PERMISSIONS_STORAGE_ID = '@kandengue_pro:permissions'
// kandengue-auth
export const AUTH_STORAGE_ID = '@kandengue_pro:auth'
// kandengue-pin
export const AUTH_STORAGE_PIN = '@kandengue_pro:pin'
// kandengue-theme
export const THEME_STORAGE_ID = '@kandengue_pro:theme'

export const STORAGE_KEYS = {
  USER: 'user',
  TOKEN: 'token',
  PIN: 'pin'
}
export const STORAGE_EXPIRATION = {
  USER: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  TOKEN: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  PIN: 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
}
