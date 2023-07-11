import { UpdateQuery } from "mongoose";
import detailSaleModel, { detailSaleDocument } from "../model/detailSale.model";

export const deviceLiveData = new Map();

export const liveDataChangeHandler = (data) => {
  const regex = /[A-Z]/g;

  let liveData: number[] = data.split(regex);

  deviceLiveData.set(liveData[0], [liveData[1], liveData[2]]);

  console.log(deviceLiveData.get(liveData[0]));
};
