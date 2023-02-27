import express, {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import * as dotenv from "dotenv";
import mongoose from "mongoose";
import { AuthRouter } from "./auth/auth.controller";
import { IResponse } from "./util/data";
import { createLogManager } from "simple-node-logger";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const app = express();
app.use(express.json());

const logger = createLogManager().createLogger("APP.ts");

app.use("/auth", AuthRouter);

const errorHandler: ErrorRequestHandler = function (
  err: any,
  _: Request,
  res: Response,
  _1: NextFunction
) {
  const resMsg: IResponse = {
    message: err.message || "Error processing your request, please try later.",
    status: 500,
  };
  res.status(500).json();

  logger.error(err);
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
