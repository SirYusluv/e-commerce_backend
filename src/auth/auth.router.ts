import { Router } from "express";
import { signup, signin } from "./auth.service";

export const AuthRouter = Router();

AuthRouter.post("/signup", signup);

AuthRouter.post("/signin", signin);
