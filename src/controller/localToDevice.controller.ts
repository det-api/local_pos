import { Request, Response, NextFunction } from "express";
import { connectingFunction } from "../connection/device.connection";
import fMsg from "../utils/helper";


export const connectDeviceHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    let result = await connectingFunction()
    fMsg(res ,'Connection Finish' , result)
  }