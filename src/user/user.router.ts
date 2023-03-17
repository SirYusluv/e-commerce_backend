import { Router } from "express";
import { isAccountUserGuard } from "../guards/is-account-user.guard";
import { isSalesUserGuard } from "../guards/is-sales-user.guard";
import { isUserAdminUserGuard } from "../guards/is-user-admin-user.guard";
import { AccountRouter } from "./account/account.router";
import { SalesRouter } from "./sales/sales.router";
import { UserAdminRouter } from "./user-admin/user-admin.router";
import { deleteUser, getUser, modifyUser } from "./user.service";

export const UserRouter = Router();

UserRouter.patch("/user", modifyUser);

UserRouter.get("/user", getUser);

UserRouter.delete("/user/:userId", deleteUser);

UserRouter.use("/user-admin", isUserAdminUserGuard, UserAdminRouter);
UserRouter.use("/account", isAccountUserGuard, AccountRouter);
UserRouter.use("/sales", isSalesUserGuard, SalesRouter);
