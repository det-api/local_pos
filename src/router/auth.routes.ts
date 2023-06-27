import { postAuthHandler } from "../controller/auth.controller";

const auth = require("express").Router();

auth.post('/' , postAuthHandler)

export default auth


  