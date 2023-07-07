import mongoose, { Schema } from "mongoose";
import { getDailyReportByDate } from "../service/dailyReport.service";
import moment from "moment-timezone";

export interface detailSaleDocument extends mongoose.Document {
  stationDetailId: string;
  dailyReportDate: string;
  vocono: string;
  carNo: string;
  vehicleType: string;
  nozzleNo: number;
  fuelType: string;
  cashType: string;
  casherCode: string;
  couObjId: string;
  asyncAlready: string;
  salePrice: number;
  saleLiter: number;
  totalPrice: number;
  totalizer_liter: number;
  createAt: Date;
}

// const detailSaleSchema = new Schema({
//   stationDetailId: {
//     type: Schema.Types.ObjectId,
//     require: true,
//     ref: "stationDetail",
//   },
//   vocono: { type: String, required: true, unique: true },
//   carNo: { type: String, default: null }, //manual
//   vehicleType: { type: String, default: "car" }, //manual
//   nozzleNo: { type: Number, required: true },
//   fuelType: { type: String, required: true },

//   cashType: {
//     type: String,
//     enum: ["Cash", "KBZ Pay", "Credi", "FOC", "Others"],
//     require: true,
//   },
//   casherCode: { type: String, require: true },
//   couObjId: { type: Schema.Types.ObjectId, default: null },
//   asyncAlready: {
//     type: String,
//     enum: ["0", "1", "2"],
//     require: true,
//   },

//   salePrice: { type: Number, default: 0 },
//   saleLiter: { type: Number, default: 0 },
//   totalPrice: { type: Number, default: 0 },
//   totalizer_liter: { type: Number, default: 0 },
//   totalizer_amount: { type: Number, default: 0 },

//   dailyReportDate: {
//     type: String,
//     default: new Date().toLocaleDateString(`fr-CA`),
//   },
//   createAt: { type: Date, default: new Date() },
// });

const detailSaleSchema = new Schema({
  stationDetailId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "stationDetail",
  },
  vocono: { type: String, required: true, unique: true },
  carNo: { type: String, default: null },
  vehicleType: { type: String, default: "car" },
  nozzleNo: { type: Number, required: true },
  fuelType: { type: String, required: true },

  cashType: {
    type: String,
    enum: ["Cash", "KBZ Pay", "Credit", "FOC", "Others"],
  },
  casherCode: { type: String, required: true },
  couObjId: { type: Schema.Types.ObjectId, default: null },
  asyncAlready: {
    type: String,
    default : "0" ,
    enum: ["0", "1", "2" , "3" , "4"],
  },

  salePrice: { type: Number, default: 0 },
  saleLiter: { type: Number, default: 0 },
  totalPrice: { type: Number, default: 0 },
  totalizer_liter: { type: Number, default: 0 },
  totalizer_amount: { type: Number, default: 0 },

  dailyReportDate: {
    type: String,
    default: new Date().toLocaleDateString("fr-CA"),
  },
  createAt: { type: Date, default: Date.now },
});


detailSaleSchema.pre("save", function (next) {
  if (this.fuelType == "001-Octane Ron(92)" && this.salePrice < 5000) {
    this.vehicleType = "Cycle";
  }
  const options = { timeZone: "Asia/Yangon", hour12: false };

  const currentDate = moment().tz("Asia/Yangon").format("YYYY-MM-DD");
  const currentDateTime = new Date().toLocaleTimeString("en-US", options);

  let iso: Date = new Date(`${currentDate}T${currentDateTime}.000Z`);

  this.createAt = iso;
  console.log(this)

  if (this.dailyReportDate) {
    next();
    return;
  }
  this.dailyReportDate = currentDate;
  next();
});

const detailSaleModel = mongoose.model<detailSaleDocument>(
  "detailSale",
  detailSaleSchema
);

export default detailSaleModel;
