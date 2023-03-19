import { Router } from "express";
import { postOrder } from "./order.service";

export const OrderRouter = Router();

OrderRouter.post("/order", postOrder);
