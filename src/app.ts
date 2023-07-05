import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import config from "config";
import cors from "cors";
import fileUpload from "express-fileupload";
import userRoute from "./router/user.routes";
import mqtt from "mqtt";
import permitRoute from "./router/permit.routes";
import roleRoute from "./router/role.routes";
import detailSaleRoute from "./router/detailSale.routes";
import localToDeviceRoute from "./router/localToDevice.routes";
import coustomerRoute from "./router/coustomer.routes";
import deviceRoute from "./router/device.routes";
import debtRoute from "./router/debt.routes";
import dailyReportRoute from "./router/dailyReport.routes";
import fuelBalanceRoute from "./router/fuelBalance.routes";
import fuelInRoute from "./router/fuelIn.routes";

const app = express();
app.use(express.json());
app.use(fileUpload());
app.use(cors({ origin: "*" }));

const server = require("http").createServer(app);

//mqtt

export const client = mqtt.connect("ws://192.168.0.112:9001" , {
  username: "detpos",
  password: "asdffdsa",
});

export const sub_topic = "detpos/local_server/";

const connect = () => {
  client.subscribe("#", { qos: 0 }, function (err) {
    if (err) {
      console.log("An error occurred while subscribing");
    } else {
      console.log("Subscribed successfully to " + sub_topic.toString());
    }
  });
};

client.on("connect", connect);

client.on("message", async (topic, message) => {
  console.log(topic, "///", message.toString());
  // let income = topic + "/" + message.toString();
  //reseive data from device
});

// socket
const io = require("socket.io-client");

let socket = io.connect("http://13.251.206.31:9000");
socket.on("connect", () => {
  console.log("Connected to Raspberry Pi server");

  // Send data to the Raspberry Pi server
  socket.emit("test", "Hello from local");

  // Receive data from the Raspberry Pi server
  socket.on("test", (data) => {
    console.log("Received data:", data);
  });
});

socket.on("disconnect", () => {
  console.log("Disconnected from Raspberry Pi server");
});

//require data

const port = config.get<number>("port");
const host = config.get<string>("host");
const dbUrl = config.get<string>("dbUrl");

//mongodb connection

mongoose.connect(dbUrl);
mongoose.connection.on("error", (error) => {
  // Handle mongodb connection error
  console.error("Error connecting to the database:", error);
});

app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.send("ok");
});

app.use("/api/user", userRoute);
app.use("/api/permit", permitRoute);
app.use("/api/role", roleRoute);

app.use("/api/detail-sale", detailSaleRoute);

app.use("/api/device-connection", localToDeviceRoute);
app.use("/api/coustomer" , coustomerRoute)
app.use('/api/device' , deviceRoute)

app.use('/api/debt' , debtRoute)

app.use("/api/daily-report", dailyReportRoute);
app.use("/api/fuel-balance", fuelBalanceRoute);
app.use("/api/fuelIn", fuelInRoute);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  err.status = err.status || 409;
  res.status(err.status).json({
    con: false,
    msg: err.message,
  });
});

server.listen(port, () =>
  console.log(`server is running in  http://${host}:${port}`)
);
