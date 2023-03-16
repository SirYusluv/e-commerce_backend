import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { UserType } from "../user/user.schema";
import {
  HTTP_STATUS,
  IResponse,
  ITEM_IMAGES_COUNT,
  SPLIT_PATTERN,
} from "../util/data";
import { Category, CategoryType } from "./category.schema";
import { SaveItemDto } from "./dtos/save-item.dto";
import { Item } from "./item.schema.";

export async function addItem(req: Request, res: Response, next: NextFunction) {
  try {
    const images = Array.isArray(req.files)
      ? (req.files.map((file) => file.filename) as [string, string, string])
      : null;

    if (!images || images.length !== ITEM_IMAGES_COUNT) {
      const response: IResponse = {
        message: "image processing error",
        status: HTTP_STATUS.badRequest,
      };
      return res.status(response.status).json(response);
    }

    const {
      itemName,
      price: priceStr,
      itemDescription1,
      itemDescription2,
      remainingCount: remainingCountStr,
      categories: categoriesStrArr,
    } = req.body;

    const price = Number(priceStr);
    const remainingCount = Number(remainingCountStr);
    const { _id: addedBy } = req.body.user as UserType;
    // convert categories: string[] to ObjectId[]
    const categories = await Promise.all(
      (categoriesStrArr as string[]).map(async function (category) {
        let fetchedCategory: CategoryType | null;
        fetchedCategory = await findCategory({ category });
        // create category if not exist
        !fetchedCategory && (fetchedCategory = await createCategory(category));
        return fetchedCategory._id;
      })
    );

    const saveItemDto = new SaveItemDto(
      itemName,
      price,
      images,
      itemDescription1,
      itemDescription2,
      remainingCount,
      addedBy,
      categories
    );

    const item = await new Item(saveItemDto).save();
    const response: IResponse = {
      message: "Item saved successfully",
      status: HTTP_STATUS.created,
      item,
    };
    res.status(response.status).json(response);
  } catch (err: any) {
    next(err);
  }
}

export async function findCategory({
  category,
  _id,
}: {
  category?: string;
  _id?: Types.ObjectId;
}) {
  if (!category && !_id)
    throw new Error(
      `Category or _id must be provided.${SPLIT_PATTERN}${HTTP_STATUS.badRequest}`
    );

  const categoryQuery = Category.findOne();

  _id && categoryQuery.where("_id", _id);
  category && categoryQuery.where("category", category);

  return categoryQuery.exec();
}

export async function createCategory(category: string) {
  if (!category)
    throw new Error(
      `Invalid category provided.${SPLIT_PATTERN}${HTTP_STATUS.badRequest}`
    );
  return new Category({ category }).save();
}
