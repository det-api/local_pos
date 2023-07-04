import { connectDeviceHandler } from "../controller/localToDevice.controller";
const localToDeviceRoute = require("express").Router();

localToDeviceRoute.post('/' , connectDeviceHandler)

localToDeviceRoute.post('/' , )
 
export default localToDeviceRoute