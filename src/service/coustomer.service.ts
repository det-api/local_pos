import { FilterQuery } from "mongoose";
import coustomerModel, { coustomerDocument } from "../model/coustomer.model";

export const getCoustomer = async (query: FilterQuery<coustomerDocument>) => {
  try {
    return await coustomerModel.find(query).lean().select("-__v");
  } catch (e) {
    throw new Error(e);
  }
};

export const addCoustomer = async (body: coustomerDocument) => {
  try {
    return await new coustomerModel(body).save();
  } catch (e) {
    throw new Error(e);
  }
};

export const deleteCoustomer = async (
  query: FilterQuery<coustomerDocument>
) => {
  try {
    return await coustomerModel.deleteMany(query);
  } catch (e) {
    throw new Error(e);
  }
};

export const searchCoustomer = async (key: string) => {
  try {
    if (typeof key !== "string") {
      throw new Error("Invalid search key. Expected a string.");
    }
    let result = await coustomerModel.find({
      $or: [{ cou_name: { $regex: key } }],
    });
    return result;
  } catch (e) {
    throw new Error(e);
  }
};
