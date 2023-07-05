import mongoose from "mongoose";
import { Schema } from "mongoose";

export interface debtInput {
  stationDetailId: string;
  cou_objId: string;
  credit: number;
  deposit: number;
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
    credit: { type: Number, default: 0 },
    deposit: { type: Number, default: 0 },
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
