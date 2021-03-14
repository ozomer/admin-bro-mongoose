import { Filter } from 'admin-bro'
import mongoose from 'mongoose'

const escapeRegexp = /([.*+?=^!:${}()|[\]/\\])/g

/**
 * Changes AdminBro's {@link Filter} to an object acceptible by a mongoose query.
 *
 * @param {Filter} filter
 * @private
 */
export const convertFilter = (filter: Filter) => filter.reduce((memo, filterProperty) => {
  const { property, value } = filterProperty
  switch (property.type() as string) {
  case 'string':
    return {
      [property.name()]: {
        $regex: String(value).replace(escapeRegexp, '\\$1'),
        $options: 'i',
      },
      ...memo,
    }
  case 'date':
  case 'datetime':
    if ((typeof value !== 'string') && (value.from || value.to)) {
      return {
        [property.name()]: {
          ...value.from && { $gte: value.from },
          ...value.to && { $lte: value.to },
        },
        ...memo,
      }
    }
    break
  case 'id':
    if ((typeof value === 'string') && mongoose.Types.ObjectId.isValid(value)) {
      return {
        [property.name()]: value,
        ...memo,
      }
    }
    return {}
  default:
    break
  }
  return {
    [property.name()]: value,
    ...memo,
  }
}, {})
