const userRoute = require("express").Router();
import { hasAnyPermit } from "../middleware/permitValidator";
import { roleValidator } from "../middleware/roleValidator";
import { validateAll, validateToken } from "../middleware/validator";
import {
  deleteUserHandler,
  getUserByAdminHandler,
  getUserHandler,
  loginUserHandler,
  registerUserHandler,
  updateUserHandler,
  userAddPermitHandler,
  userAddRoleHandler,
  userRemovePermitHandler,
  userRemoveRoleHandler,
} from "../controller/user.controller";
import { createUserSchema, loginUserSchema, userPermitSchema, userRoleSchema } from "../schema/schema";

//register user
userRoute.post("/register", validateAll(createUserSchema), registerUserHandler);

//login user
userRoute.post("/login", validateAll(loginUserSchema), loginUserHandler);

//update
userRoute.patch(
  "/",
  validateToken,
  roleValidator(["admin"]),
  hasAnyPermit(["edit"]),
  updateUserHandler
);

//getuser
userRoute.get(
  "/",
  // validateToken,
  getUserHandler
  );

//delete each user
userRoute.delete(
  "/",
  // validateToken,
  // roleValidator(["admin"]),
  // hasAnyPermit(["delete"]),
  deleteUserHandler
);

//admin routes
//beware deleting all user route
userRoute.delete("/admin", validateToken, deleteUserHandler);
userRoute.get("/admin", validateToken, getUserByAdminHandler);

//adding role in user
userRoute.patch(
  "/add/role",
  // validateToken,
  // validateAll(userRoleSchema),
  // roleValidator(["admin"]),
  // hasAnyPermit(["add"]),
  userAddRoleHandler
);

userRoute.patch(
  "/remove/role",
  validateToken,
  // validateAll(userRoleSchema),
  // roleValidator(["admin"]),
  // hasAnyPermit(["delete"]),
  userRemoveRoleHandler
);

//adding permit in user
userRoute.patch(
  "/add/permit",
  // validateToken,
  // validateAll(userPermitSchema),
  // roleValidator(["admin"]),
  // hasAnyPermit(["add"]),
  userAddPermitHandler
);
userRoute.patch(
  "/remove/permit",
  // validateToken,
  // validateAll(userPermitSchema),
  // roleValidator(["admin"]),
  // hasAnyPermit(["delete"]),
  userRemovePermitHandler
);

export default userRoute;


// [
//   {
//       "_id": "64a51e63ac2749c9d16092a5",
//       "name": "add",
//       "__v": 0
//   },
//   {
//       "_id": "64a51e70ac2749c9d16092a7",
//       "name": "view",
//       "__v": 0
//   },
//   {
//       "_id": "64a51e77ac2749c9d16092a9",
//       "name": "edit",
//       "__v": 0
//   },
//   {
//       "_id": "64a51e7eac2749c9d16092ab",
//       "name": "delete",
//       "__v": 0
//   }
// ]