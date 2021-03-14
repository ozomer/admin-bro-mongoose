import { BaseProperty } from 'admin-bro'
import { Schema, SchemaType } from 'mongoose'

const ID_PROPERTY = '_id'
const VERSION_KEY_PROPERTY = '__v'

interface SchemaString {
  enumValues: string[];
  regExp: string;
  path: string;
  instance: string;
  validators: { type: string }[];
  setters: object[];
  getters: object[];
  options?: { ref: string | null };
  _index: object;
  position: number;
  caster?: SchemaString;
  schema?: Schema;
}

class Property extends BaseProperty {
    // TODO: Fix typings
    public mongoosePath: SchemaString;

    /**
     * Crates an object from mongoose schema path
     *
     * @param  {SchemaString}   path
     * @param  {String[]}       path.enumValues
     * @param  {String}         path.regExp
     * @param  {String}         path.path
     * @param  {String}         path.instance
     * @param  {Object[]}       path.validators
     * @param  {Object[]}       path.setters
     * @param  {Object[]}       path.getters
     * @param  {Object}         path.options
     * @param  {Object}         path._index
     * @param  {number}         position
     *
     * @private
     *
     * @example
     *
     * const schema = new mongoose.Schema({
     *   email: String,
     * })
     *
     * property = new Property(schema.paths.email))
     */
    constructor(path: SchemaType, position = 0) {
      const mongoosePath = path as unknown as SchemaString
      super({ path: mongoosePath.path, position })
      this.mongoosePath = mongoosePath
    }

    instanceToType(mongooseInstance: string) {
      switch (mongooseInstance) {
      case 'String':
        return 'string'
      case 'Boolean':
        return 'boolean'
      case 'Number':
        return 'number'
      case 'Date':
        return 'datetime'
      case 'Embedded':
        return 'mixed'
      case 'ObjectID':
        if (this.reference()) {
          return 'reference'
        }
        return 'string'
      case 'Decimal128':
        return 'float'
      default:
        return 'string'
      }
    }

    name() {
      return this.mongoosePath.path
    }

    isEditable() {
      return this.name() !== VERSION_KEY_PROPERTY && this.name() !== ID_PROPERTY
    }

    reference() {
      if (this.isArray()) {
        return (
          this.mongoosePath.caster && this.mongoosePath.caster.options
          && this.mongoosePath.caster.options.ref
        ) ?? null
      }
      return (this.mongoosePath.options && this.mongoosePath.options.ref) ?? null
    }

    isVisible() {
      return this.name() !== VERSION_KEY_PROPERTY
    }

    isId() {
      return this.name() === ID_PROPERTY
    }

    availableValues() {
      return this.mongoosePath.enumValues?.length ? this.mongoosePath.enumValues : null
    }

    isArray() {
      return this.mongoosePath.instance === 'Array'
    }

    subProperties() {
      if (this.type() === 'mixed') {
        const subPaths = Object.values(this.mongoosePath.caster?.schema?.paths ?? {})
        return subPaths.map(p => new Property(p))
      }
      return []
    }

    type() {
      if (this.isArray()) {
        let { instance } = this.mongoosePath.caster ?? {}
        // For array of embedded schemas mongoose returns null for caster.instance
        // That is why we have to check if caster has a schema
        if (!instance && this.mongoosePath.caster?.schema) {
          instance = 'Embedded'
        }
        return this.instanceToType(instance ?? '')
      }
      return this.instanceToType(this.mongoosePath.instance)
    }

    isSortable() {
      return this.type() !== 'mixed' && !this.isArray()
    }

    isRequired() {
      return !!this.mongoosePath.validators?.find?.(validator => validator.type === 'required')
    }
}

export default Property
