import vine from '@vinejs/vine'

export const createProjectRequestValidator = vine.compile(
  vine.object({
    name: vine.string().trim(),
    description: vine.string().trim(),
  })
)
