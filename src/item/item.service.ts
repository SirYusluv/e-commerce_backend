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
import { Item, ItemType } from "./item.schema.";

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
      (
        (categoriesStrArr as string).toLocaleLowerCase().split(",") as string[]
      ).map(async function (category) {
        let fetchedCategory: CategoryType | null;
        fetchedCategory = await findCategory({
          category: category.toLowerCase(),
        });
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
        (categoriesStrArr.toString().toLowerCase().split(",") as string[]).map(
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
  category && categoryQuery.where("category", category.toLowerCase());

  return categoryQuery.exec();
}

export async function createCategory(category: string) {
  if (!category)
    throw new Error(
      `Invalid category provided.${SPLIT_PATTERN}${HTTP_STATUS.badRequest}`
    );
  return new Category({ category: category.toLowerCase() }).save();
}

// this should be probably be refractored but deadline soon
export async function getItem(req: Request, res: Response, next: NextFunction) {
  try {
    const { itemId, itemName: itemNameQr, category: categoriesQr } = req.body;
    const { limit, page, topSelling, limitedInStock } = req.query;
    const skip = Number(page) || 0;
    const lim = Number(limit) || 10;
    const isTopSelliing =
      topSelling?.toString() === "true"
        ? true
        : topSelling?.toString() === "false"
        ? false
        : null;
    const isLimitedInStock =
      limitedInStock?.toString() === "true"
        ? true
        : limitedInStock?.toString() === "false"
        ? false
        : null;

    let items: ItemType[] | null;

    // if search is by topselling or limitedInStock
    if (isTopSelliing || isLimitedInStock) {
      const response = await getTopsellingOrLimitedInStockItems(
        skip,
        lim,
        isTopSelliing || undefined,
        isLimitedInStock || undefined
      );
      return res.status(response.status).json(response);
    }

    // if search is by id
    if (itemId) {
      const _id = new Types.ObjectId(itemId);
      const item = await Item.findById(_id).exec();
      items = item && [item];

      const response: IResponse = {
        message: "",
        status: HTTP_STATUS.ok,
        items,
      };
      return res.status(response.status).json(response);
    }

    // if item name exist
    const itemName = itemNameQr?.toString();
    if (itemName) {
      const itemsQr = Item.find();
      //.limit(lim).skip(skip);
      itemsQr.where("itemName", itemName);
      const count = await itemsQr.clone().countDocuments();
      itemsQr.limit(lim);
      itemsQr.skip(skip);
      items = await itemsQr.exec();

      const response: IResponse = {
        message: "",
        status: HTTP_STATUS.ok,
        items,
        count,
      };
      return res.status(response.status).json(response);
    }

    // search by category if provided
    const categories = categoriesQr?.toString()?.toLowerCase(); // actually, just sigle category.
    if (categories) {
      // category here is a string, first get it's id
      const categoryModel = await Category.findOne({
        category: categories.toLowerCase(),
      });
      if (!categoryModel) {
        const response: IResponse = {
          message: "Invalid category provided.",
          status: HTTP_STATUS.badRequest,
        };
        return res.status(response.status).json(response);
      }

      const itemQuery = Item.find();
      itemQuery.where("categories", categoryModel._id);
      const count = await itemQuery.clone().countDocuments();
      items = await itemQuery.limit(lim).skip(skip).exec();

      const response: IResponse = {
        message: "",
        status: HTTP_STATUS.ok,
        items,
        count,
      };
      return res.status(response.status).json(response);
    }

    // if items is still null (no query or param) return list of items
    const itemsQuery = Item.find();
    const count = await itemsQuery.clone().countDocuments();
    items = await itemsQuery.limit(lim).skip(skip).exec();

    const response: IResponse = {
      message: "",
      status: HTTP_STATUS.ok,
      items,
      count,
    };
    res.status(response.status).json(response);
  } catch (err: any) {
    next(err);
  }
}

export async function getCategories(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      page: pageQr,
      limit: limitQr,
      sortByReference: sortByReferenceQr,
    } = req.query;
    const page = Number(pageQr?.toString()) || 0;
    const limit = Number(limitQr) || 10;
    const sortByReference =
      sortByReferenceQr?.toString() === "true"
        ? true
        : sortByReferenceQr?.toString() === "false"
        ? false
        : null;

    const categories = await getCategoryList(
      page,
      limit,
      sortByReference || undefined
    );

    const response: IResponse = {
      message: "",
      status: HTTP_STATUS.ok,
      categories,
    };
    res.status(response.status).json(response);
  } catch (err: any) {
    next(err);
  }
}

export function getCategoryList(
  page: number,
  limit: number,
  sortByReference?: boolean
) {
  const categoryQuery = Category.find();
  sortByReference && categoryQuery.sort({ referencedCount: "desc" });
  const categories = categoryQuery.skip(page).limit(limit).exec();
  return categories;
}

// if search is by topselling or limitedInStock
export async function getTopsellingOrLimitedInStockItems(
  skip: number,
  lim: number,
  isTopSelling?: boolean,
  isLimitedInStock?: boolean,
  category?: string
) {
  const categoryDb = await Category.findOne({
    category: category?.toLowerCase(),
  });

  const itemQuery = Item.find();
  categoryDb && itemQuery.where("categories", categoryDb._id);
  const count = await itemQuery.clone().countDocuments();
  isTopSelling && itemQuery.sort({ boughtByCount: "desc" });
  isLimitedInStock && itemQuery.sort({ limitedInStock: "asc" });
  skip && itemQuery.skip(skip);
  const items = await itemQuery.limit(lim).exec();

  const response: IResponse = {
    message: "",
    status: HTTP_STATUS.ok,
    items,
    count,
  };
  return response;
}
