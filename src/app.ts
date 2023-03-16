import express, {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import * as dotenv from "dotenv";
import mongoose from "mongoose";
import { AuthRouter } from "./auth/auth.router";
import {
  HTTP_STATUS,
  IResponse,
  ITEM_IMAGES_COUNT,
  SPLIT_PATTERN,
} from "./util/data";
import { createLogManager } from "simple-node-logger";
import { UserRouter } from "./user/user.router";
import { isAuthenticatedGuard } from "./guards/is-authenticated.guard";
import { ItemRouter } from "./item/item.router";
import multer from "multer";
import path from "path";
import { v4 as uuid } from "uuid";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const app = express();
app.use(express.json());

const logger = createLogManager().createLogger("APP.ts");

const storage = multer.diskStorage({
  destination: function (_, _1, cb) {
    cb(null, path.join(__dirname, "../", "public", "/"));
  },
  filename: function (_, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uuid()}${ext}`);
  },
});

// TODO: try uploading more than 3 images
export const upload = multer({
  storage,
}).array("files", ITEM_IMAGES_COUNT);

app.use("/auth", AuthRouter);
app.use("/user", isAuthenticatedGuard, UserRouter);
app.use("/item", isAuthenticatedGuard, ItemRouter);

const errorHandler: ErrorRequestHandler = function (
  err: any,
  _: Request,
  res: Response,
  _1: NextFunction
) {
  try {
    const errMsgAndStatus = (err.message as string).split(SPLIT_PATTERN);
    const message = errMsgAndStatus[0];
    const status = Number(errMsgAndStatus[1]);
    const resMsg: IResponse = {
      message: message || "Error processing your request, please try later.",
      status: status || HTTP_STATUS.internalServerError,
    };
    res.status(status).json(resMsg);

    logger.error(err);
  } catch (e: any) {
    res.status(HTTP_STATUS.internalServerError).json({
      message: "Error processing your request, please try later.",
      status: HTTP_STATUS.internalServerError,
    });
    logger.error(e);
  }
};

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, async function () {
  logger.info("Listening on PORT: ", PORT);
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(process.env.MONGODB_URI as string);
    logger.info("connection to DB established");
  } catch (err: any) {
    logger.error(err);
  }
});
