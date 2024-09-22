import vine from '@vinejs/vine'
import { passwordPattern } from '../utils/common_patterns.js'

export const registrationRequestValidator = vine.compile(
  vine.object({
    firstname: vine.string().trim(),
    lastname: vine.string().trim(),
    email: vine
      .string()
      .trim()
      .email()
      .unique(async (db, value) => {
        const user = await db.from('users').where('email', value.toLowerCase()).first()
        return !user
      })
      .transform<string>((value) => value.toLowerCase()),
    password: vine.string().trim().regex(passwordPattern),
    password_confirmation: vine.string().trim().sameAs('password'),
  })
)

export const resendEmailVerificationMailRequestValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
  })
)

export const verifyEmailRequestValidator = vine.compile(
  vine.object({
    token: vine.string().trim(),
  })
)
