import { Router } from "express";
import { userAdminCreateUser } from "./user-admin.service";

export const UserAdminRouter = Router();

UserAdminRouter.use("/create-user", userAdminCreateUser);
