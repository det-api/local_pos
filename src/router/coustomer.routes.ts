import { addCoustomerHandler, deletCoustomerHandler, getCoustomerHandler } from "../controller/coustomer.controller";

  const coustomerRoute = require("express").Router();
  
  coustomerRoute.get(
    "/",
    getCoustomerHandler
  );
  coustomerRoute.post(
    "/",
    addCoustomerHandler
  );
  coustomerRoute.delete(
    "/",
    deletCoustomerHandler
  );
  
  export default coustomerRoute;
  