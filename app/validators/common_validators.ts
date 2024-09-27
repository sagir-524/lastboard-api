import vine from '@vinejs/vine'

export const paginatedRequestValidationRules = vine.object({
  page: vine
    .number()
    .positive()
    .min(1)
    .optional()
    .transform((value) => value || 1),
  perPage: vine
    .number()
    .positive()
    .min(1)
    .max(100)
    .optional()
    .transform((value) => value || 10),
})
