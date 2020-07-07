import mongoose from 'mongoose';

const { Schema } = mongoose;
mongoose.set('useFindAndModify', false);

const schemaOptions = {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
};

const roleModelSchema = {
  _id: { type: Schema.ObjectId, auto: true },
  name: { type: String, required: true, unique: true },
  status: { type: String, enum: ['active', 'disabled'], default: 'active' },
  createdAt: Date,
  updatedAt: Date,
};

const roleSchema = new Schema(roleModelSchema, schemaOptions);

roleSchema.pre('save', async function preSave(next) {
  const currentDate = new Date();
  this.updatedAt = currentDate;

  if (!this.created_at) {
    this.createdAt = currentDate;
  }
  next();
});

// eslint-disable-next-line consistent-return
roleSchema.statics.findOneOrCreate = async function findOneOrCreate(query, data) {
  try {
    const role = await this.findOneAndUpdate(
      query,
      { $setOnInsert: data },
      { upsert: true, new: true },
    ).exec();

    if (role) {
      return role;
    }
  } catch (e) {
    return new Error(`Role Schema findOneOrCreate error: ${e.message}.`);
  }
};

const roleModel = mongoose.model('role', roleSchema);

export default roleModel;
