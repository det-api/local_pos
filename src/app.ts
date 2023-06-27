import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import config from "config";
import cors from "cors";
import fileUpload from "express-fileupload";
import userRoute from "./router/user.routes";
import mqtt from "mqtt";
import auth from "./router/auth.routes";
import { pumpRequest } from "./utils/pumpRequest";

const app = express();
app.use(express.json());
app.use(fileUpload());
app.use(cors({ origin: "*" }));

const server = require("http").createServer(app);

//mqtt

export const client = mqtt.connect("ws://192.168.0.101:8884", {
  username: "detpos",
  password: "det131337329",
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

// app.use('/api/user' , userRoute)

app.use("/api/auth", auth);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  err.status = err.status || 409;
  res.status(err.status).json({
    con: false,
    msg: err.message,
  });
});

// pumpRequest();

server.listen(port, () =>
  console.log(`server is running in  http://${host}:${port}`)
);