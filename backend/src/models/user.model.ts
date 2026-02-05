import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { compareValue, hashValue } from "../utils/bcrypt.js";

// Remove sensitive fields and convert _id to id
const userTransform = (_doc: any, ret: any) => {
  delete ret.password;
  if (ret._id) {
    ret.id = ret._id;
    delete ret._id;
  }
  return ret;
};

/**
 * User schema. Password field is `select: false` to avoid accidental leakage.
 * toJSON transform removes sensitive fields and converts `_id` to `id`.
 */
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      select: false,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true, transform: userTransform },
    toObject: { virtuals: true, transform: userTransform },
  },
);

userSchema.pre("save", async function (this: any) {
  if (this.isModified("password") && this.password) {
    this.password = await hashValue(this.password as string);
  }
});

userSchema.methods.comparePassword = async function (
  password: string,
): Promise<boolean> {
  const hashed: string | undefined = this.password as unknown as
    | string
    | undefined;
  return compareValue(password, hashed);
};

export type UserDocument = InferSchemaType<typeof userSchema> & {
  comparePassword(password: string): Promise<boolean>;
};

export const UserModel = mongoose.model("User", userSchema);
