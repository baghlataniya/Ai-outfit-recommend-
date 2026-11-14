import { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";
import { AddressSchema, IAddress } from "./Address";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
  avatar?: string;
  role: "user" | "admin";
  authProvider: "local" | "google";
  googleId?: string;
  emailVerified: boolean;
  passwordResetTokenHash?: string;
  passwordResetExpires?: Date;
  emailVerificationTokenHash?: string;
  emailVerificationExpires?: Date;
  addresses: IAddress[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: false, select: false },
    phone: { type: String, trim: true, default: "" },
    avatar: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    authProvider: { type: String, enum: ["local", "google"], default: "local" },
    googleId: { type: String, default: undefined, sparse: true, index: true },
    emailVerified: { type: Boolean, default: false },
    passwordResetTokenHash: { type: String, default: undefined, sparse: true, select: false },
    passwordResetExpires: { type: Date, default: undefined, select: false },
    emailVerificationTokenHash: { type: String, default: undefined, sparse: true, select: false },
    emailVerificationExpires: { type: Date, default: undefined, select: false },
    addresses: [AddressSchema],
  },
  { timestamps: true }
);

// Indexes
UserSchema.index({ passwordResetTokenHash: 1 }, { sparse: true });
UserSchema.index({ emailVerificationTokenHash: 1 }, { sparse: true });

// Hash password before saving if modified and present
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as Error);
  }
});

// Compare input password with stored hash
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Omit sensitive fields from JSON outputs
UserSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.passwordResetTokenHash;
    delete ret.passwordResetExpires;
    delete ret.emailVerificationTokenHash;
    delete ret.emailVerificationExpires;
    return ret;
  },
});

export const User = model<IUser>("User", UserSchema);
