import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { Item } from "../item/item.schema.";
import { UserType } from "../user/user.schema";
import { HTTP_STATUS, IResponse } from "../util/data";
import { Save, SaveType } from "./save.schema";

export async function addItemToSave(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.body.user as UserType;
    const { itemId: itemIdStr } = req.body;
    const itemId = new Types.ObjectId(itemIdStr?.toString());

    if (!itemId) {
      const response: IResponse = {
        message: "Item id must be provided",
        status: HTTP_STATUS.badRequest,
      };
      return res.status(response.status).json(response);
    }

    // check if item exist
    if (!(await Item.findOne({ _id: itemId }))) {
      const response: IResponse = {
        message: "Item does not exist.",
        status: HTTP_STATUS.ok,
      };
      return res.status(response.status).json(response);
    }

    let save: SaveType | null = null;

    // make sure user has a save
    save = await Save.findOne({ owner: user._id });
    !save && (save = new Save({ owner: user._id }));

    // if there is still no save after trying to create
    if (!save) {
      const response: IResponse = {
        message: "User's save not found.",
        status: HTTP_STATUS.ok,
      };
      return res.status(response.status).json(response);
    }

    // save does exist
    // add item to save
    //first check if item
    // if not found, add to save
    if (!save.items!!.includes(itemId)) {
      save.items!!.push(itemId);
    }
    await save.save();

    const response: IResponse = {
      message: "Item successfully added to save.",
      status: HTTP_STATUS.ok,
    };
    res.status(response.status).json(response);
  } catch (err: any) {
    next(err);
  }
}

export async function removeItemFromSave(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const itemId = req.params.itemId;
    const user = req.body.user as UserType;
    const _id = new Types.ObjectId(itemId);

    const userSave = await Save.findOne({ owner: user._id });

    if (!userSave) {
      const response: IResponse = {
        message: "User's save not found.",
        status: HTTP_STATUS.ok,
      };
      return res.status(response.status).json(response);
    }

    userSave.items!!.forEach((item, i, save) => {
      if (item.equals(itemId)) {
        save.splice(i, 1);
      }
    });

    await userSave.save();
    const response: IResponse = {
      message: "Item removes successfully.",
      status: HTTP_STATUS.ok,
    };
    res.status(response.status).json(response);
  } catch (err: any) {
    next(err);
  }
}

export async function getSave(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.body.user as UserType;
    const response: IResponse = {
      message: "",
      status: HTTP_STATUS.ok,
      save: await Save.findOne({ owner: user._id }),
    };
    res.status(response.status).json(response);
  } catch (err: any) {
    next(err);
  }
}
