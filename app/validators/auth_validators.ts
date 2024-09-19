import vine from '@vinejs/vine'

export const registrationRequestValidator = vine.compile(
  vine.object({
    firstname: vine.string().trim().minLength(1).maxLength(50),
    lastname: vine.string().trim().minLength(1).maxLength(50),
    email: vine
      .string()
      .trim()
      .email()
      .unique(async (db, value) => {
        const user = await db.from('users').where('email', value).first()
        return !user
      }),
    password: vine.string().trim().minLength(6).maxLength(16).alphaNumeric(),
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
