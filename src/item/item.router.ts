import { Router } from "express";
import { upload } from "../app";
import { addItem } from "./item.service";

export const ItemRouter = Router();

ItemRouter.post("/item", addItem);
