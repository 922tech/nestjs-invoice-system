import { Schema } from 'mongoose';

export function toJSONPlugin(schema: Schema) {
  schema.set('toJSON', {
    transform: function (doc, ret) {
      delete ret.__v;
      ret.id = ret._id;
      delete ret._id;
      return ret;
    },
  });
}