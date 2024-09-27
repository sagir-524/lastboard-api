import Project from '#models/project'
import User from '#models/user'
import {
  projectsListRequestValidator,
  saveProjectRequestValidator,
} from '#validators/project_validators'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class ProjectsController {
  async index({ auth, request }: HttpContext) {
    const { search, page, perPage, sortBy, sortOrder, status } = await request.validateUsing(
      projectsListRequestValidator
    )

    const user = auth.use('jwt').user as User
    const query = user.related('projects').query()

    query.apply((scopes) => (status === 'active' ? scopes.active() : scopes.deleted()))

    if (search) {
      query.whereILike('name', search).andWhereILike('description', search)
    }

    return query.orderBy(sortBy, sortOrder).paginate(page, perPage)
  }

  async store({ auth, request, response }: HttpContext) {
    const { name, description } = await request.validateUsing(saveProjectRequestValidator)
    const trx = await db.transaction()
    const user = auth.use('jwt').user as User

    try {
      const project = new Project()
      project.name = name
      project.description = description
      project.ownerId = user.id
      project.cretorId = user.id

      await project.useTransaction(trx).save()
      await project.related('users').attach([user.id], trx)
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

  async show({ params }: HttpContext) {
    return Project.query()
      .apply((q) => q.active())
      .where('id', params.id)
      .preload('statuses', (b) => b.apply((scopes) => scopes.active()))
      .preload('users', (b) => b.apply((scopes) => scopes.active()))
      .firstOrFail()
  }

  async update({ params, request, response }: HttpContext) {
    const project = await Project.query()
      .apply((q) => q.active())
      .where('id', params.id)
      .firstOrFail()

    const { name, description } = await request.validateUsing(saveProjectRequestValidator)
    project.name = name
    project.description = description

    await project.save()
    return response.noContent()
  }

  async destroy({ params, response }: HttpContext) {
    const project = await Project.query()
      .apply((q) => q.active())
      .where('id', params.id)
      .firstOrFail()

    project.deletedAt = DateTime.now()
    await project.save()
    return response.noContent()
  }

  async restore({ params, response }: HttpContext) {
    const project = await Project.query()
      .apply((q) => q.deleted())
      .where('id', params.id)
      .firstOrFail()

    project.deletedAt = null
    await project.save()
    return response.noContent()
  }
}
