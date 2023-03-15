import { Router } from "express";
import { userAdminCreateUser } from "./user-admin.service";

export const UserAdminRouter = Router();

UserAdminRouter.post("/create-user", userAdminCreateUser);
