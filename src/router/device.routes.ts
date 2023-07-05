import { addDeviceHandler, deletDeviceHandler, getDeviceHandler } from "../controller/device.controller";

const deviceRoute = require("express").Router();

deviceRoute.get(
"/",
getDeviceHandler
);
deviceRoute.post(
"/",
addDeviceHandler
);
deviceRoute.delete(
"/",
deletDeviceHandler
);

export default deviceRoute;
  