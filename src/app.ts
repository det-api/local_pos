import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import config from "config";
import cors from "cors";
import fileUpload from "express-fileupload";

const app = express();
app.use(express.json());
app.use(fileUpload());
app.use(cors({ origin: "*" }));

const server = require("http").createServer(app);

// const io = require("socket.io")(server);

// io.on("connection", (socket: any) => {
//   socket.on("test", (data) => {
//     console.log("User send data", data);
//       ;
//   });
// });
const io = require('socket.io-client');

let socket = io.connect('http://13.251.206.31:9000'); 
socket.on('connect', () => {
  console.log('Connected to Raspberry Pi server');

  // Send data to the Raspberry Pi server
  socket.emit('test', 'Hello from local');

  // Receive data from the Raspberry Pi server
  socket.on('test', (data) => {
    console.log('Received data:', data);
  });
});

socket.on('disconnect', () => {
  console.log('Disconnected from Raspberry Pi server');
});

//require data

const port = config.get<number>("port");
const host = config.get<string>("host");
const dbUrl = config.get<string>("dbUrl");

//mongodb connection

mongoose.connect(dbUrl);

app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.send("ok");
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  err.status = err.status || 409;
  res.status(err.status).json({
    con: false,
    msg: err.message,
  });
});

let httpServer = server.listen(port, () =>
  console.log(`server is running in  http://${host}:${port}`)
);
   