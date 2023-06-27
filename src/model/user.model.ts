import mongoose from "mongoose";
import { Schema } from "mongoose";
import bcrypt, { hash } from "bcryptjs";
import { encode } from "../utils/helper";

export interface UserInput {
  email: string;
  phone: number;
  name: string;
  password: string;
}

export interface UserDocument extends UserInput, mongoose.Document {
  roles: roleDocument["_id"];
  permits: permitDocument["_id"];
  stationId: stationDetailDocument["_id"];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    phone: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    stationId: { type: Schema.Types.ObjectId, required: true },
    roles: [{ type: Schema.Types.ObjectId, ref: "role" }],
    permits: [{ type: Schema.Types.ObjectId, ref: "permit" }],
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  let user = this as UserDocument;

  if (!user.isModified("password")) {
    return next();
  }


  user.password = hash;

  return next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  const user = this as UserDocument;

  return bcrypt.compare(candidatePassword, user.password).catch((e) => false);
};

const UserModel = mongoose.model<UserDocument>("user", userSchema);

export default UserModel;
