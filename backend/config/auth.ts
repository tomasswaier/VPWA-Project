import {defineConfig} from '@adonisjs/auth'
import {tokensGuard, tokensUserProvider} from '@adonisjs/auth/access_tokens'
import type {
  Authenticators, InferAuthenticators, InferAuthEvents} from
  '@adonisjs/auth/types'

const authConfig = defineConfig({
  default : 'access_tokens',

  guards : {
    access_tokens : tokensGuard({
      provider : tokensUserProvider({
        tokens : 'auth_access_tokens',
        model : () => import('#models/user'),
      }),
    }),
  },
})

export default authConfig

/**
 * Typing support
 */
declare module '@adonisjs/auth/types' {
  export interface Authenticators extends
      InferAuthenticators<typeof authConfig> {}
}

declare module '@adonisjs/core/types' {
  interface EventsList extends InferAuthEvents<Authenticators> {}
}
