import { ValidationError } from 'admin-bro'

interface SubError {
  message: string;
  name: string;
  kind?: string;
}

interface NestedError {
  errors: Record<string, SubError>;
}

export const createValidationError = (
  originalError: NestedError,
): ValidationError => {
  const errors = Object.keys(originalError.errors).reduce((memo, key) => {
    const { message, kind, name } = originalError.errors[key]
    return {
      ...memo,
      [key]: {
        message,
        type: kind || name,
      },
    }
  }, {})
  return new ValidationError(errors)
}
