import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface coustomerDocument extends mongoose.Document {
  cou_name: string;
  cou_id: string;
  cou_debt: number;
}

const coustomerSchema = new Schema({
  cou_name: { type: String, required: true },
  cou_id: { type: String, unique: true, default: uuidv4().substr(0, 6) },
  cou_phone: { type: Number, unique: true },
  cou_debt: { type: Number, default: 0 },
});

const coustomerModel = mongoose.model<coustomerDocument>(
  "coustomer",
  coustomerSchema
);

export default coustomerModel;
