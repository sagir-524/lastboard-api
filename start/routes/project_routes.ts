import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

router
  .group(() => {
    router.get('/', '#controllers/projects_controller.index').as('index')
    router.post('/', '#controllers/projects_controller.store').as('store')
    router.get('/:id', '#controllers/projects_controller.show').as('show')
    router.put('/:id', '#controllers/#controllers/projects_controller.update').as('update')
    router.delete('/:id', '#controllers/projects_controller.destroy').as('destroy')
    router.patch('/:id/restore', '#controllers/projects_controller.restore').as('restore')
  })
  .prefix('api/projects')
  .as('api.projects')
  .middleware([middleware.auth()])
