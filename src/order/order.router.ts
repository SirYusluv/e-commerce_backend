import { Router } from "express";
import { getReceipts, postOrder } from "./order.service";

export const OrderRouter = Router();

OrderRouter.post("/order", postOrder);

OrderRouter.get("/receipts", getReceipts);
