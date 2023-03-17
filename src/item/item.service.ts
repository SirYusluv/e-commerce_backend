import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { UserType } from "../user/user.schema";
import {
  ACCOUNTS,
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
    const addedBy = (req.body.user as UserType)._id;
    // convert categories: string[] to ObjectId[]
    const categories = await Promise.all(
      (categoriesStrArr.split(",") as string[]).map(async function (category) {
        let fetchedCategory: CategoryType | null;
        fetchedCategory = await findCategory({ category });
        // create category if not exist
        !fetchedCategory && (fetchedCategory = await createCategory(category));

        fetchedCategory.referencedCount!!++;
        fetchedCategory.save();
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
      message: "Item saved successfully.",
      status: HTTP_STATUS.created,
      item,
    };
    res.status(response.status).json(response);
  } catch (err: any) {
    next(err);
  }
}

export async function updateItem(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      _id: idStr,
      itemName,
      price: priceStr,
      itemDescription1,
      itemDescription2,
      remainingCount: remainingCountStr,
      categories: categoriesStrArr,
    } = req.query; // I don't need dto here

    if (!idStr) {
      const response: IResponse = {
        message: "You must provide item Id.",
        status: HTTP_STATUS.badRequest,
      };
      return res.status(response.status).json(response);
    }

    const _id = new Types.ObjectId(idStr.toString());
    const price = Number(priceStr);
    const remainingCount = Number(remainingCountStr);
    const categories =
      categoriesStrArr?.toString() &&
      (await Promise.all(
        (categoriesStrArr.toString().split(",") as string[]).map(
          async function (category) {
            let fetchedCategory: CategoryType | null;
            fetchedCategory = await findCategory({ category });
            // create category if not exist
            !fetchedCategory &&
              (fetchedCategory = await createCategory(category));

            //increment category reference count if exist
            if (fetchedCategory) {
              fetchedCategory.referencedCount!!++;
              fetchedCategory.save();
            }
            return fetchedCategory._id;
          }
        )
      ));

    const item = await Item.findById(_id);
    if (!item) {
      const response: IResponse = {
        message: "Item not found.",
        status: HTTP_STATUS.ok,
      };
      return res.status(response.status).json(response);
    }

    // -- prev category ref num
    if (item.categories) {
      item.categories.map(async (category) => {
        const categoryModel = await findCategory({ _id: category });
        if (categoryModel?.referencedCount) {
          categoryModel.referencedCount--;
          categoryModel.save();
        }
      });
    }

    // modify item
    item.itemName = itemName?.toString() || item.itemName;
    item.price = price || item.price;
    item.itemDescription1 =
      itemDescription1?.toString() || item.itemDescription1;
    item.itemDescription2 =
      itemDescription2?.toString() || item.itemDescription2;
    item.remainingCount = remainingCount || item.remainingCount;
    item.categories = categories || item.categories;
    await item.save();

    const response: IResponse = {
      message: "Item  modified succesfully.",
      status: HTTP_STATUS.ok,
      item,
    };
    res.status(response.status).json(response);
  } catch (err: any) {
    next(err);
  }
}

export async function deleteItem(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    let _id: Types.ObjectId | string = req.params.itemId;
    _id = new Types.ObjectId(_id);
    Item.findOneAndDelete({ _id }).exec();
    const response: IResponse = {
      message: "Item deleted successfully.",
      status: HTTP_STATUS.ok,
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
