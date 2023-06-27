import { Request, Response, NextFunction } from "express";
import { client } from "../app";
import { sub_topic } from "../app";
import fMsg from "../utils/helper";
import { number } from "zod";

export const postAuthHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let pumpNo = req.query.pumpNo?.toString();
    let message = req.query.message?.toString();
    if (!pumpNo || !message) {
      throw new Error("you need pumpNo or message");
    }

    client.publish(sub_topic + "ap/" + pumpNo, message);
    fMsg(res, "all is well");
  } catch (e) {
    console.log(e);
  }
};
