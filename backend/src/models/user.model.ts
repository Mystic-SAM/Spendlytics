import mongoose, { Document, Schema } from "mongoose";
import { compareValue, hashValue } from "../utils/bcrypt.js";

export interface UserDocument extends Document {
  name: string;
  email: string;
  profilePicture?: string | null;
  password: string;
  isSuperAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
  omitPassword(): Omit<UserDocument, "password">;
}

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
    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.pre("save", async function (this: any) {
  if (this.isModified("password") && this.password) {
    this.password = await hashValue(this.password as string);
  }
});

userSchema.methods.omitPassword = function (): Omit<UserDocument, "password"> {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

userSchema.methods.comparePassword = async function (
  password: string,
): Promise<boolean> {
  const hashed: string | undefined = this.password as unknown as
    | string
    | undefined;
  return compareValue(password, hashed);
};

export const UserModel = mongoose.model<UserDocument>("User", userSchema);
