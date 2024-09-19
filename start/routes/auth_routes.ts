import router from '@adonisjs/core/services/router'

router
  .group(() => {
    router.post('register', '#controllers/auth_controller.register').as('register')
    router.post('verify', '#controllers/auth_controller.verifyEmail').as('verify')
    router
      .post('verify/resent', '#controllers/auth_controller.resendEmailVerificationMail')
      .as('verify.resend')
  })
  .prefix('api/auth')
  .as('api.auth')
