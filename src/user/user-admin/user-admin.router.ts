import { Router } from "express";
import { getUsers, userAdminCreateUser } from "./user-admin.service";

export const UserAdminRouter = Router();

UserAdminRouter.post("/create-user", userAdminCreateUser);
UserAdminRouter.get("/users", getUsers);
