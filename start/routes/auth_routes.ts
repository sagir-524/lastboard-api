import router from '@adonisjs/core/services/router'

router
  .group(() => {
    router.post('register', '#controllers/auth_controller.register').as('register')
    router.post('verify', '#controllers/auth_controller.verifyEmail').as('verify')
    router
      .post('resend-verification-email', '#controllers/auth_controller.resendEmailVerificationMail')
      .as('resend-verification-email')
  })
  .prefix('api/auth')
  .as('api.auth')
