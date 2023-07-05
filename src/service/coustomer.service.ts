import { FilterQuery } from "mongoose";
import coustomerModel, { coustomerDocument } from "../model/coustomer.model";

export const getCoustomer = async (query: FilterQuery<coustomerDocument>) => {
  try {
    return await coustomerModel
      .find(query)
      .lean()
      .populate("permits")
      .select("-__v");
  } catch (e) {
    throw new Error(e);
  }
};

export const addCoustomer = async (body: coustomerDocument) => {
  try {
    console.log("ek")
    return await new coustomerModel(body).save();
  } catch (e) {
    throw new Error(e);
  }
};

export const deleteCoustomer = async (query: FilterQuery<coustomerDocument>) => {
  try {
    return await coustomerModel.deleteMany(query);
  } catch (e) {
    throw new Error(e);
  }
};