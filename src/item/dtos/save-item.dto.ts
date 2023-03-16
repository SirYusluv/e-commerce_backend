import { Types } from "mongoose";
import { HTTP_STATUS, SPLIT_PATTERN } from "../../util/data";

export class SaveItemDto {
  itemName: string | null = null;
  price: number | null = null;
  images: [string, string, string] | null = null;
  itemDescription1: string | null = null;
  itemDescription2: string | null = null;
  remainingCount: number | null = null;
  addedBy: Types.ObjectId | null = null;
  categories: Types.ObjectId[] | null = null;

  constructor(
    itemName?: string,
    price?: number,
    images?: [string, string, string],
    itemDescription1?: string,
    itemDescription2?: string,
    remainingCount?: number,
    addedBy?: Types.ObjectId,
    categories?: Types.ObjectId[]
  ) {
    this.setItemName(itemName);
    this.setPrice(price);
    this.setImages(images);
    this.setItemDescription1(itemDescription1);
    this.setItemDescription2(itemDescription2);
    this.setRemainingCount(remainingCount);
    this.setAddedBy(addedBy);
    this.setCategories(categories);
  }

  private setItemName(itemName?: string) {
    if (!itemName)
      throw new Error(
        `Item name must be priovided.${SPLIT_PATTERN}${HTTP_STATUS.badRequest}`
      );
    this.itemName = itemName;
  }

  private setPrice(price?: number) {
    if (!price || price <= 0)
      throw new Error(
        `Price must be provided and greater than 0.${SPLIT_PATTERN}${HTTP_STATUS.badRequest}`
      );
    this.price = price;
  }

  private setImages(images?: [string, string, string]) {
    if (!images)
      throw new Error(
        `Images must be provided.${SPLIT_PATTERN}${HTTP_STATUS.badRequest}`
      );
    this.images = images;
  }

  private setItemDescription1(itemDescription1?: string) {
    if (!itemDescription1)
      throw new Error(
        `Item description 1 must be provided.${SPLIT_PATTERN}${HTTP_STATUS.badRequest}`
      );
    this.itemDescription1 = itemDescription1;
  }

  private setItemDescription2(itemDescription2?: string) {
    itemDescription2 = itemDescription2;
  }

  private setRemainingCount(remainingCount?: number) {
    if (!remainingCount || remainingCount <= 0)
      throw new Error(
        `Number of item remaining must be provided.${SPLIT_PATTERN}${HTTP_STATUS.badRequest}`
      );
    this.remainingCount = remainingCount;
  }

  private setAddedBy(addedBy?: Types.ObjectId) {
    this.addedBy = addedBy || null;
  }

  private setCategories(categories?: Types.ObjectId[]) {
    if (!categories || !categories.length)
      throw new Error(
        `Item must belong to at least 1 category.${SPLIT_PATTERN}${HTTP_STATUS.badRequest}`
      );
    this.categories = categories;
  }
}
