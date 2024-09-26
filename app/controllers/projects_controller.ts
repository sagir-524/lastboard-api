import Project from '#models/project'
import User from '#models/user'
import { createProjectRequestValidator } from '#validators/project_validators'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class ProjectsController {
  /**
   * Display a list of resource
   */
  async index({}: HttpContext) {}

  /**
   * Display form to create a new record
   */
  async create({ auth, request, response }: HttpContext) {
    const { name, description } = await request.validateUsing(createProjectRequestValidator)
    const trx = await db.transaction()
    const user = auth.use('jwt').user as User

    try {
      const project = new Project()
      project.name = name
      project.description = description
      project.ownerId = user.id
      project.cretorId = user.id
      await project.useTransaction(trx).save()

      // create default statuses
      await project.related('statuses').createMany(
        [
          { name: 'Todo', creatorId: user.id, order: 1 },
          { name: 'In progress', creatorId: user.id, order: 1 },
          { name: 'Completed', creatorId: user.id, order: 3 },
        ],
        { client: trx }
      )

      await trx.commit()
      return response.created(project)
    } catch {
      await trx.rollback()
      return response.internalServerError({
        message: 'Something went wrong. Please try again later',
      })
    }
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request }: HttpContext) {}

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {}

  /**
   * Edit individual record
   */
  async edit({ params }: HttpContext) {}

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request }: HttpContext) {}

  /**
   * Delete record
   */
  async destroy({ params }: HttpContext) {}
}
