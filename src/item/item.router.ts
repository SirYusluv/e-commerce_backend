import { Router } from "express";
import { upload } from "../app";
import { isSalesUserGuard } from "../guards/is-sales-user.guard";
import { addItem, deleteItem, updateItem } from "./item.service";

export const ItemRouter = Router();

ItemRouter.post("/item", isSalesUserGuard, addItem);

ItemRouter.patch("/item", isSalesUserGuard, updateItem);

ItemRouter.delete("/item/:itemId", isSalesUserGuard, deleteItem);
