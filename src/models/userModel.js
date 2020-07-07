import mongoose from 'mongoose';

mongoose.set('debug', true);

const { Schema } = mongoose;
mongoose.set('useFindAndModify', false);

const schemaOptions = {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
};

const userModelSchema = {
  _id: { type: Schema.Types.ObjectId, auto: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  status: { type: String, enum: ['active', 'disabled'], default: 'active' },
  role: [{ type: Schema.Types.ObjectId, ref: 'role' }],
  createdAt: Date,
  updatedAt: Date,
};

const userSchema = new Schema(userModelSchema, schemaOptions);

userSchema.pre('save', async function preSave(next) {
  const currentDate = new Date();
  this.updatedAt = currentDate;

  if (!this.createdAt) {
    this.createdAt = currentDate;
  }

  next();
});

// eslint-disable-next-line consistent-return
userSchema.statics.findOneOrCreate = async function findOneOrCreate(query, data) {
  try {
    const user = await this.findOneAndUpdate(
      query,
      { $setOnInsert: data },
      { upsert: true, new: true },
    )
      .populate('role')
      .exec();

    if (user) {
      return user;
    }
  } catch (e) {
    return new Error(`User Schema findOneOrCreate error: ${e.message}.`);
  }
};

const userModel = mongoose.model('user', userSchema);

export default userModel;
