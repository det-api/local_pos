import mongoose, { Schema } from "mongoose";

export interface deviceDocument extends mongoose.Document{
  dep_no : string
  nozzle_no : string
  fuel_type : string
}

const deviceSchema = new Schema({
   dep_no : {type: String , require : true},
   nozzle_no : {type: String , require : true},
   fuel_type : {type: String , require : true}
});


const deviceModel = mongoose.model<deviceDocument>(
  "device",
  deviceSchema
);

export default deviceModel;