import { Request, Response, NextFunction } from "express";
import fMsg from "../utils/helper";
import { DebtPaginate, addDebt, deleteDebt, updateDebt } from "../service/debt.service";

export const getDebtHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let pageNo = Number(req.params.page);

    let { data, count } = await DebtPaginate(pageNo, req.query);
    fMsg(res, "Debt are here", data, count);
  } catch (e) {
    next(new Error(e));
  }
};

export const addDebtHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let result = await addDebt(req.body);
    fMsg(res, "New Debt data was added", result);
  } catch (e) {
    next(new Error(e));
  }
};

export const updateDebtHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let result = await updateDebt(req.query, req.body);
    fMsg(res, "updated Debt data", result);
  } catch (e) {
    next(new Error(e));
  }
};

export const deleteDebtHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await deleteDebt(req.query);
    fMsg(res, "Debt data was deleted");
  } catch (e) {
    next(new Error(e));
  }
};
