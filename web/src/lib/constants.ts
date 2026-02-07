export const APP_VERSION = '3.0.0'
export const APP_NAME = 'AppControlX'

export const ROUTES = {
  DASHBOARD: '/dashboard',
  TOOLS: '/tools',
  SETTINGS: '/settings',
  ABOUT: '/about'
} as const

export const APP_ACTIONS = {
  FREEZE: 'FREEZE',
  UNFREEZE: 'UNFREEZE',
  FORCE_STOP: 'FORCE_STOP',
  UNINSTALL: 'UNINSTALL',
  CLEAR_CACHE: 'CLEAR_CACHE',
  CLEAR_DATA: 'CLEAR_DATA',
  RESTRICT_BACKGROUND: 'RESTRICT_BACKGROUND',
  ALLOW_BACKGROUND: 'ALLOW_BACKGROUND'
} as const

export const SAFETY_LEVELS = {
  CRITICAL: 'CRITICAL',
  FORCE_STOP_ONLY: 'FORCE_STOP_ONLY',
  WARNING: 'WARNING',
  SAFE: 'SAFE'
} as const

export const EXECUTION_MODES = {
  ROOT: 'ROOT',
  SHIZUKU: 'SHIZUKU',
  NONE: 'NONE'
} as const
