import { ValidationError } from 'admin-bro'

const createDuplicateMessage = (message: string) => ({
  type: 'duplicate',
  message,
})

interface DuplicateKeyError {
  keyValue: object;
  errmsg: string;
}

export const createDuplicateError = (
  { keyValue: duplicateEntry, errmsg }: DuplicateKeyError, document: object,
): ValidationError => {
  if (!duplicateEntry) {
    const duplicatedKey = Object.keys(document).find(key => errmsg.includes(key)) ?? ''

    return new ValidationError({
      [duplicatedKey]: createDuplicateMessage(`Record with that ${duplicatedKey} already exists`),
    })
  }

  const [[keyName]] = Object.entries(duplicateEntry)

  return new ValidationError({
    [keyName]: createDuplicateMessage(`Record with that ${keyName} already exists`),
  })
}
