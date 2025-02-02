import { ValidationError } from 'admin-bro'

interface CastError {
  path: string;
  message: string;
  name: string;
  kind?: string;
}


export const createCastError = (originalError: CastError): ValidationError => {
  // cas error has only the nested path. So when an actual path is 'parents.age'
  // originalError will have just a 'age'. That is why we are finding first param
  // with the same value as the error has and path ending the same like path in
  // originalError or ending with path with array notation: "${path}.0"
  const errors = {
    [originalError.path]: {
      message: originalError.message,
      type: originalError.kind || originalError.name,
    },
  }
  return new ValidationError(errors)
}
