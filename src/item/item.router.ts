import { Router } from "express";
import { upload } from "../app";
import { isSalesUserGuard } from "../guards/is-sales-user.guard";
import { addItem, updateItem } from "./item.service";

export const ItemRouter = Router();

ItemRouter.post("/item", isSalesUserGuard, addItem);

ItemRouter.patch("/item", isSalesUserGuard, updateItem);
