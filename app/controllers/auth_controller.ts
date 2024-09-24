import User from '#models/user'
import {
  clearPreviousVerificationTokens,
  sendUserVerificationEmail,
  verifyTokenAndGetEmail,
} from '#services/auth_service'
import {
  loginReuestValidator,
  refreshRequestValidator,
  registrationRequestValidator,
  resendEmailVerificationMailRequestValidator,
  verifyEmailRequestValidator,
} from '#validators/auth_validators'
import type { HttpContext } from '@adonisjs/core/http'
import encryption from '@adonisjs/core/services/encryption'
import hash from '@adonisjs/core/services/hash'
import { DateTime } from 'luxon'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    const payload = await request.validateUsing(registrationRequestValidator)
    const user = new User()

    user.email = payload.email
    user.firstname = payload.firstname
    user.lastname = payload.lastname
    user.password = payload.password

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
        message: 'Verification token is either invalid or expired.',
      })
    }

    const email = await verifyTokenAndGetEmail(decryptedToken)

    if (!email) {
      return response.badRequest({
        message: 'Verification token is either invalid or expired.',
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

  async login({ auth, request, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginReuestValidator)
    const user = await User.query()
      .withScopes((q) => q.active())
      .where('email', email)
      .first()

    if (!user?.verifiedAt) {
      return response.notAcceptable({
        message: 'Your email is not verified.',
      })
    }

    if (!user || !(await hash.verify(user.password, password))) {
      return response.badRequest({
        message: 'Email or password did not match.',
      })
    }

    const res = await auth.use('jwt').generate(user)
    return { user, ...res }
  }

  async refresh({ auth, request, response }: HttpContext) {
    const { refreshToken } = await request.validateUsing(refreshRequestValidator)
    const userId = await auth.use('jwt').validateRefreshToken(refreshToken)

    if (!userId) {
      return response.badRequest({
        message: 'Token is either expired or not valid.',
      })
    }

    const user = await User.query()
      .withScopes((q) => q.active())
      .first()

    if (!user?.verifiedAt) {
      return response.notAcceptable({
        message: 'Your email is not verified.',
      })
    }

    const res = await auth.use('jwt').generate(user)
    await auth.use('jwt').deleteRefreshToken(refreshToken)
    return { ...res, user }
  }
}
