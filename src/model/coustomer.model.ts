import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface coustomerDocument extends mongoose.Document {
  cou_name: string;
  cou_id: string;
}

const coustomerSchema = new Schema({
  cou_name: { type: String, required: true },
  cou_id: { type: String, unique: true, default: uuidv4().substr(0, 6) },
});


const coustomerModel = mongoose.model<coustomerDocument>(
  "coustomer",
  coustomerSchema
);

export default coustomerModel;