import User from '#models/user'
import env from '#start/env'
import { cuid } from '@adonisjs/core/helpers'
import encryption from '@adonisjs/core/services/encryption'
import mail from '@adonisjs/mail/services/main'
import redis from '@adonisjs/redis/services/main'

const generateEmailVerificationTokenRedisKey = (userId: number, token: string): string => {
  return `verify-user-email:${userId}:${token}`
}

export const clearPreviousVerificationTokens = async (user: User, skipToken?: string) => {
  let keys = await redis.keys(`verify-user-email:${user.id}:*`)

  if (skipToken) {
    keys = keys.filter((key) => key !== generateEmailVerificationTokenRedisKey(user.id, skipToken))
  }

  await redis.del(...keys)
}

export const sendUserVerificationEmail = async (user: User) => {
  const verificationToken = cuid()
  const encryptedToken = encryption.encrypt(verificationToken)

  await Promise.all([
    // storinng the verification token for 1 hour
    redis.set(
      generateEmailVerificationTokenRedisKey(user.id, verificationToken),
      user.email,
      'EX',
      60 * 60
    ),
    // sending the verification email later in queue
    mail.sendLater((message) => {
      message
        .to(user.email)
        .from(`noreply@${env.get('HOST')}`)
        .html(
          `Please <a href="${env.get('APP_URL')}/auth/verify-email/${user.email}/${encryptedToken}">click here</a> to verify your email`
        )
    }),
  ])

  return verificationToken
}

export const verifyTokenAndGetEmail = async (token: string): Promise<string | null> => {
  const keys = await redis.keys(`verify-user-email:*:${token}`)
  if (keys.length) {
    return redis.get(keys[0])
  }

  return null
}
