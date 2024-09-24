import router from '@adonisjs/core/services/router'

router
  .group(() => {
    router.post('register', '#controllers/auth_controller.register').as('register')
    router.post('verify', '#controllers/auth_controller.verifyEmail').as('verify')
    router
      .post('resend-verification-email', '#controllers/auth_controller.resendEmailVerificationMail')
      .as('resend-verification-email')

    router.post('login', '#controllers/auth_controller.login').as('login')
    router.post('refresh', '#controllers/auth_controller.refresh').as('refresh')
  })
  .prefix('api/auth')
  .as('api.auth')
