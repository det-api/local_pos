import mongoose, { Schema } from "mongoose";
import { number, string } from "zod";

export interface deviceDocument extends mongoose.Document {
  dep_no: string;
  nozzle_no: string;
  fuel_type: string;
  daily_price: number;
}

const deviceSchema = new Schema({
  dep_no: { type: String, require: true }, //1
  nozzle_no: { type: String, required: true }, //5
  fuel_type: { type: String, required: true },
  daily_price: { type: Number, required: true },
});

const deviceModel = mongoose.model<deviceDocument>("device", deviceSchema);

export default deviceModel;
