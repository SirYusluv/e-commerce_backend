import { Router } from "express";
import {
  signup,
  signin,
  sendPasswordResetMail,
  resetPassword,
  getTopBoughtOrLimited,
  getCategories,
} from "./auth.service";

export const AuthRouter = Router();

AuthRouter.post("/signup", signup);

AuthRouter.post("/signin", signin);

AuthRouter.get("/send-password-reset-mail/:email", sendPasswordResetMail);

AuthRouter.post("/reset-password/:id", resetPassword);

AuthRouter.get("/item", getTopBoughtOrLimited);

AuthRouter.get("/categories", getCategories);
