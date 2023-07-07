import { FilterQuery, UpdateQuery } from "mongoose";
import detailSaleModel, { detailSaleDocument } from "../model/detailSale.model";
import config from "config";
import { UserDocument } from "../model/user.model";
import moment from "moment-timezone";
import { mqttEmitter } from "../utils/helper";

import axios from "axios";

const currentDate = moment().tz("Asia/Yangon").format("YYYY-MM-DD");
const cuurentDateForVocono = moment().tz("Asia/Yangon").format("DDMMYYYY");
const url = "http://localhost:7000/api/detail-sale";

interface Data {
  nozzleNo: string;
  fuelType: string;
  vocono: string;
  casherCode: string;
  asyncAlready: string;
  user: UserDocument[];
}

const limitNo = config.get<number>("page_limit");

export const getDetailSale = async (query: FilterQuery<detailSaleDocument>) => {
  try {
    return await detailSaleModel
      .find(query)

      .populate("stationDetailId")
      .select("-__v");
  } catch (e) {
    throw new Error(e);
  }
};

export const addDetailSale = async (
  depNo: string,
  nozzleNo: string,
  body: Data
) => {
  try {
    const count = await detailSaleModel.countDocuments({
      dailyReportDate: currentDate,
    });
    body = {
      ...body,
      vocono: `${body.user[0].stationNo}/${
        body.user[0].name
      }/${cuurentDateForVocono}/${count + 1}`,
      casherCode: body.user[0].name,
      asyncAlready: "0",
    };

    // const lastDocument = await detailSaleModel
    //   .findOne({ nozzleNo: body.nozzleNo })
    //   .sort({ _id: -1 , createAt: -1 });

    // if (lastDocument?.saleLiter == 0 || lastDocument?.vehicleType == null) {
    //   throw new Error("you need to fill");
    // }

    let result = await new detailSaleModel(body).save();
    mqttEmitter(`detpos/local_server/${depNo}`, nozzleNo + "appro");
    return result;
  } catch (e) {
    throw new Error(e);
  }
};

export const updateDetailSale = async (
  query: FilterQuery<detailSaleDocument>,
  body: UpdateQuery<detailSaleDocument>
) => {
  try {
    let data = await detailSaleModel.findOne(query);
    if (!data) throw new Error("no data with that id");

    switch (data.asyncAlready) {
      case "0":
        console.log("wk0");
        body = {
          ...body,
          asyncAlready: "1",
        };
        break;
      case "2":
        body = {
          ...body,
          asyncAlready: "3",
        };
        break;
    }

    await detailSaleModel.updateMany(query, body);

    let updatedData = await detailSaleModel.find({ asyncAlready: 3 });

    updatedData.forEach(async (ea) => {
      try {
        let response = await axios.post(url, ea);
        console.log(response.status);

        if (response.status == 200) {
          await detailSaleModel.findByIdAndUpdate(ea._id, {
            asyncAlready: "4",
          });
        }
      } catch (e) {
        throw new Error(e);
      }
    });
    return await detailSaleModel.findById(data._id).lean();
  } catch (e) {
    throw new Error(e);
  }
};

export const detailSaleUpdateByDevice = async (topic, message) => {
  console.log(topic, message);

  const regex = /[A-Z]/g;

  let data: number[] = message.split(regex);
  // console.log(Number(data[0]))

  let query = {
    nozzleNo: data[0],
  };
  let updateBody: UpdateQuery<detailSaleDocument> = {
    nozzleNo: data[0],
    salePrice: data[1],
    saleLiter: data[2],
    totalPrice: data[3],
    totalizer_liter: data[4],
  };

  const lastData: any = await detailSaleModel
    .find(query)
    .sort({ _id: -1, createAt: -1 })
    .limit(2);

  console.log(lastData);

  switch (lastData[0].asyncAlready) {
    case "0":
      console.log("wk0");
      updateBody = {
        ...updateBody,
        asyncAlready: "2",
      };
      break;
    case "1":
      console.log("wk0");
      updateBody = {
        ...updateBody,
        asyncAlready: "3",
      };
      break;
  }

  updateBody = {
    ...updateBody,
    totalizer_amount: lastData[1]
      ? lastData[1].totalizer_amount + Number(data[3])
      : 0 + Number(data[3]),
  };

  await detailSaleModel.findByIdAndUpdate(lastData[0]._id , updateBody)
  let updatedData = await detailSaleModel.find({ asyncAlready: 3 });
  updatedData.forEach(async (ea) => {
    try {
      let response = await axios.post(url, ea);
      console.log(response.status);

      if (response.status == 200) {
        await detailSaleModel.findByIdAndUpdate(ea._id, {
          asyncAlready: "4",
        });
      }
    } catch (e) {
      throw new Error(e);
    }
  });

  return await detailSaleModel.findById(lastData[0]._id);
};

export const deleteDetailSale = async (
  query: FilterQuery<detailSaleDocument>
) => {
  try {
    let DetailSale = await detailSaleModel.find(query);
    if (!DetailSale) {
      throw new Error("No DetailSale with that id");
    }
    return await detailSaleModel.deleteMany(query);
  } catch (e) {
    throw new Error(e);
  }
};

export const getDetailSaleByFuelType = async (
  dateOfDay: string,
  // stationId : string,
  fuelType: string
) => {
  // console.log(dateOfDay);
  let fuel = await getDetailSale({
    dailyReportDate: dateOfDay,
    fuelType: fuelType,
  });

  let fuelLiter = fuel
    .map((ea) => ea["saleLiter"])
    .reduce((pv: number, cv: number): number => pv + cv, 0);
  let fuelAmount = fuel
    .map((ea) => ea["totalPrice"])
    .reduce((pv: number, cv: number): number => pv + cv, 0);

  return { count: fuel.length, liter: fuelLiter, price: fuelAmount };
};

export const detailSalePaginate = async (
  pageNo: number,
  query: FilterQuery<detailSaleDocument>
): Promise<{ count: number; data: detailSaleDocument[] }> => {
  const reqPage = pageNo == 1 ? 0 : pageNo - 1;
  const skipCount = limitNo * reqPage;
  const data = await detailSaleModel
    .find(query)
    .sort({ createAt: -1 })
    .skip(skipCount)
    .limit(limitNo)
    .populate("stationDetailId")
    .select("-__v");
  const count = await detailSaleModel.countDocuments(query);

  return { data, count };
};

export const detailSaleByDate = async (
  query: FilterQuery<detailSaleDocument>,
  d1: Date,
  d2: Date
): Promise<detailSaleDocument[]> => {
  const filter: FilterQuery<detailSaleDocument> = {
    ...query,
    createAt: {
      $gt: d1,
      $lt: d2,
    },
  };

  let result = await detailSaleModel
    .find(filter)
    .sort({ createAt: -1 })
    .populate("stationDetailId")
    .select("-__v");

  return result;
};

export const detailSaleByDateAndPagi = async (
  query: FilterQuery<detailSaleDocument>,
  d1: Date,
  d2: Date,
  pageNo: number
): Promise<{ count: number; data: detailSaleDocument[] }> => {
  try {
    const reqPage = pageNo == 1 ? 0 : pageNo - 1;
    const skipCount = limitNo * reqPage;
    // console.log(reqPage , skipCount)
    const filter: FilterQuery<detailSaleDocument> = {
      ...query,
      createAt: {
        $gt: d1,
        $lt: d2,
      },
    };

    const dataQuery = detailSaleModel
      .find(filter)
      .sort({ createAt: -1 })
      .skip(skipCount)
      .limit(limitNo)
      .populate("stationDetailId")
      .select("-__v");

    const countQuery = detailSaleModel.countDocuments(filter);

    const [data, count] = await Promise.all([dataQuery, countQuery]);

    return { data, count };
  } catch (error) {
    console.error("Error in detailSaleByDateAndPagi:", error);
    throw error;
  }
};
