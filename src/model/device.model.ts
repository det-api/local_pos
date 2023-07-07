import mongoose, { Schema } from "mongoose";
import { string } from "zod";

export interface deviceDocument extends mongoose.Document{
  dep_no : string
  nozzle_no : string
  fuel_type : string
}

const deviceSchema = new Schema({
   dep_no : {type: String , require : true}, //1
   nozzle_no : {type: String , require : true},  //5
   fuel_type : {type: String , require : true},
});


const deviceModel = mongoose.model<deviceDocument>(
  "device",
  deviceSchema
);

export default deviceModel;