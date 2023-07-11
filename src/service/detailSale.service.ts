import { FilterQuery, UpdateQuery } from "mongoose";
import detailSaleModel, { detailSaleDocument } from "../model/detailSale.model";
import config from "config";
import { UserDocument } from "../model/user.model";
import moment from "moment-timezone";
import { mqttEmitter } from "../utils/helper";
import axios from "axios";
import { getCoustomer } from "./coustomer.service";
import { addDebt } from "./debt.service";
import { deviceLiveData } from "../connection/liveTimeData";

const currentDate = moment().tz("Asia/Yangon").format("YYYY-MM-DD");
const cuurentDateForVocono = moment().tz("Asia/Yangon").format("DDMMYYYY");

const url = "http://localhost:7000/api/detail-sale";

interface Data {
  nozzleNo: string;
  fuelType: string;
  vocono: string;
  casherCode: string;
  asyncAlready: string;
  stationDetailId: string;
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
      stationDetailId: body.user[0].stationId,
      casherCode: body.user[0].name,
      asyncAlready: "0",
    };

    const lastDocument = await detailSaleModel
      .findOne({ nozzleNo: body.nozzleNo })
      .sort({ _id: -1, createAt: -1 });

    console.log(lastDocument);

    if (
      lastDocument?.saleLiter == 0 ||
      lastDocument?.vehicleType == null ||
      lastDocument?.totalPrice == 0
    ) {
      throw new Error("you need to fill previous vol");
    }

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

    //$debt

    // if (data.cashType == "Debt") {
    //   let coustomerConditon = await getCoustomer({ _id: data.couObjId });

    //   if (coustomerConditon.length == 0)
    //     throw new Error("There is no coustomer with that name");

    //   let debtBody = {
    //     stationDetailId: data.stationDetailId,
    //     vocono: data.vocono,
    //     couObjId: data.couObjId,
    //     deposit: 0,
    //     credit: data.totalPrice,
    //     liter: data.saleLiter,
    //   };

    //   let debtResult = await addDebt(debtBody);

    //   console.log(debtResult);
    // }

    await detailSaleModel.updateMany(query, body);

    let updatedData = await detailSaleModel.find({ asyncAlready: 1 });

    updatedData.forEach(async (ea) => {
      try {
        let response = await axios.post(url, ea);
        console.log(response.status);
        if (response.status == 200) {
          await detailSaleModel.findByIdAndUpdate(ea._id, {
            asyncAlready: "2",
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

export const detailSaleUpdateError = async (
  query: FilterQuery<detailSaleDocument>,
  body: UpdateQuery<detailSaleDocument>
) => {
  try {
    let data = await detailSaleModel.findOne(query);
    if (!data) throw new Error("no data with that id");

    const lastData: any = await detailSaleModel
      .find({ nozzleNo: data.nozzleNo })
      .sort({ _id: -1, createAt: -1 })
      .limit(2);

    body = {
      ...body,
      asyncAlready: "1",
      totalizer_liter: lastData[1]
        ? lastData[1].totalizer_liter + Number(body.saleLiter)
        : 0 + Number(body.saleLiter),
      totalizer_amount: lastData[1]
        ? lastData[1].totalizer_amount + Number(body.totalPrice)
        : 0 + Number(body.totalPrice),
      isError: true,
    };

    let result = await detailSaleModel.findOneAndUpdate(query, body);

    return await detailSaleModel.findOne({ _id: result?._id });
  } catch (e) {
    throw new Error(e);
  }
};

export const detailSaleUpdateByDevice = async (topic: string, message) => {
  const regex = /[A-Z]/g;
  let data: number[] = message.split(regex);

  let [saleLiter, totalPrice] = deviceLiveData.get(data[0]);

  let query = {
    nozzleNo: data[0],
  };

  const lastData: any = await detailSaleModel
    .find(query)
    .sort({ _id: -1, createAt: -1 })
    .limit(2);

  if (saleLiter == 0 || (saleLiter == null && data[2] == 0)) {
    await detailSaleModel.findByIdAndDelete(lastData[0]?._id);
    mqttEmitter(
      "detpos/local_server/message",
      `${lastData[0].nozzleNo} was deleted`
    );
    return;
  }

  let updateBody: UpdateQuery<detailSaleDocument> = {
    nozzleNo: data[0],
    salePrice: data[1],
    saleLiter: saleLiter,
    totalPrice: totalPrice,
    asyncAlready: "1",
    totalizer_liter: lastData[1]
      ? lastData[1].totalizer_liter + Number(saleLiter)
      : 0 + Number(saleLiter),
    totalizer_amount: lastData[1]
      ? lastData[1].totalizer_amount + Number(totalPrice)
      : 0 + Number(totalPrice),
  };

  let result = await detailSaleModel.findByIdAndUpdate(
    lastData[0]._id,
    updateBody
  );

  mqttEmitter("detpos/local_server", `${result?.nozzleNo}/D1S1`);
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
