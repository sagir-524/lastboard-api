import User from '#models/user'
import {
  clearPreviousVerificationTokens,
  sendUserVerificationEmail,
  verifyTokenAndGetEmail,
} from '#services/auth_service'
import {
  registrationRequestValidator,
  resendEmailVerificationMailRequestValidator,
  verifyEmailRequestValidator,
} from '#validators/auth_validators'
import type { HttpContext } from '@adonisjs/core/http'
import encryption from '@adonisjs/core/services/encryption'
import { DateTime } from 'luxon'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    const payload = await request.validateUsing(registrationRequestValidator)
    const user = new User()
    user.fill(payload)
    await user.save()
    await sendUserVerificationEmail(user)
    return response.noContent()
  }

  async resendEmailVerificationMail({ request, response }: HttpContext) {
    const { email } = await request.validateUsing(resendEmailVerificationMailRequestValidator)
    const user = await User.query()
      .withScopes((q) => q.active())
      .where('email', email)
      .firstOrFail()

    if (user.verifiedAt) {
      return response.badRequest({
        message: 'Your is already verified.',
      })
    }

    const newToken = await sendUserVerificationEmail(user)
    await clearPreviousVerificationTokens(user, newToken)
    return response.noContent()
  }

  async verifyEmail({ request, response }: HttpContext) {
    const { token } = await request.validateUsing(verifyEmailRequestValidator)
    const decryptedToken = encryption.decrypt<string>(token)

    if (!decryptedToken) {
      return response.badRequest({
        message: 'Verification token is either invalid or expire',
      })
    }

    const email = await verifyTokenAndGetEmail(decryptedToken)

    if (!email) {
      return response.badRequest({
        message: 'Verification token is either invalid or expire',
      })
    }

    const user = await User.query()
      .withScopes((q) => q.active())
      .where('email', email)
      .firstOrFail()

    user.verifiedAt = DateTime.now()
    await user.save()
    await clearPreviousVerificationTokens(user)
    return response.noContent()
  }
}
