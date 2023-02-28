import { Router } from "express";
import { signup } from "./auth.service";

export const AuthRouter = Router();

AuthRouter.post("/signup", signup);
