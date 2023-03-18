import { Router } from "express";
import { addItemToSave, getSave, removeItemFromSave } from "./save.service";

export const SaveRouter = Router();

SaveRouter.post("/save", addItemToSave);

SaveRouter.delete("/save/:itemId", removeItemFromSave);

SaveRouter.get("/save", getSave);
