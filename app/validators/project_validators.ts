import vine from '@vinejs/vine'
import { paginatedRequestValidationRules } from './common_validators.js'

export const saveProjectRequestValidator = vine.compile(
  vine.object({
    name: vine.string().trim(),
    description: vine.string().trim(),
  })
)

export const projectsListRequestValidator = vine.compile(
  vine.object({
    search: vine.string().optional(),
    sortBy: vine
      .enum(['name', 'created_at', 'updated_at', 'deleted_at'])
      .optional()
      .transform((value) => value || 'created_at'),
    sortOrder: vine
      .enum(['asc', 'desc'])
      .optional()
      .transform((value) => value || 'asc'),
    status: vine
      .enum(['active', 'deleted'])
      .optional()
      .transform((value) => value || 'active'),
    ...paginatedRequestValidationRules.getProperties(),
  })
)
