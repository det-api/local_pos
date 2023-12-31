import mongoose from "mongoose";
import { Schema } from "mongoose";

export interface debtInput {
  stationDetailId: string;
  couObjId: string;
  vocono: string;
  credit: number;
  deposit: number;
  liter: number;
}

export interface debtDocument extends debtInput, mongoose.Document {
  dateOfDay: string;
  createdAt: Date;
  updatedAt: Date;
}

const debtSchema = new Schema(
  {
    stationDetailId: {
      type: Schema.Types.ObjectId,
      require: true,
      ref: "stationDetail",
    },
    couObjId: {
      type: Schema.Types.ObjectId,
      require: true,
      ref: "coustomer",
    },
    vocono: { type: String, require: true, unique: true },
    credit: { type: Number, default: 0 },
    deposit: { type: Number, default: 0 },
    liter: { type: Number, default: 0 },
    dateOfDay: {
      type: String,
      default: new Date().toLocaleDateString(`fr-CA`),
    },
  },
  {
    timestamps: true,
  }
);

const debtModel = mongoose.model<debtDocument>("debt", debtSchema);
export default debtModel;
