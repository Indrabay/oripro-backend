const { Router } = require("express");
const { body, validationResult, param } = require("express-validator");
const { authMiddleware, ensureRole } = require("../middleware/auth");
const { createResponse } = require('../services/response');
const { UserGenderIntToStr, UserStatusIntToStr } = require("../models/User");

function InitUserRouter(userUsecase, userAccessMenuUsecase) {
  const router = Router();
  const getUsers = async (req, res) => {
    req.log?.info({}, "UserRouter.getUsers");
    if (!req.query.limit) {
      req.query.limit = "10"
      limit = 10
    }
    if (!req.query.offset) {
      req.query.offset = "0"
      offset = 0
    }
    try {
      const users = await userUsecase.listUsers(req.query, {
        requestId: req.requestId,
        log: req.log,
        roleName: req.auth.roleName,
      });
      if (users === "forbidden")
        return res.status(403).json(createResponse(null, "forbidden", 403));
      return res.status(200).json(createResponse(users.users, "success", 200, true, {
        total: users.total,
        limit: limit,
        offset: offset
      }));
    } catch (error) {
      req.log?.error(
        { error: error.message, stack: error.stack },
        "UserRouter.getUsers_error"
      );

      return res.status(500).json(createResponse(null, "Internal Server Error", 500));
    }
  };
  const getUserPermission = async (req, res) => {
    req.log?.info({ userId: req.auth.userId }, "UserRouter.getUserPermission");
    try {
      const permissions = await userUsecase.getUserPermissions(
        req.auth.userId,
        {
          requestId: req.requestId,
          log: req.log,
        }
      );
      return res.status(200).json(createResponse(permissions, "list permission", 200, true, {total: permissions.length, limit: permissions.length, offset: 0}));
    } catch (error) {
      req.log?.error({ error: error.message }, "UserRouter.getUserPermission_error");
      return res.status(500).json(createResponse(null,"Internal Server Error", 500));
    }
  };

  const getUserMenu = async (req, res) => {
    req.log?.info({ userId: req.auth.userId }, "UserRouter.getUserMenu");
    try {
      const menus = await userAccessMenuUsecase.getUserAccessibleMenus(
        req.auth.userId,
        { requestId: req.requestId, log: req.log }
      );
      return res.status(200).json(createResponse(menus, "list menu", 200, true, {total: menus.length, limit: menus.length, offset: 0}));
    } catch (error) {
      req.log?.error({ error: error.message }, "UserRouter.getUserMenu_error");
      return res.status(500).json(createResponse(null, "Internal Server Error", 500));
    }
  };

  const getUserSidebar = async (req, res) => {
    req.log?.info({ userId: req.auth.userId }, "UserRouter.getUserSidebar");
    try {
      const sidebar = await userAccessMenuUsecase.getUserSidebarData(
        req.auth.userId,
        { requestId: req.requestId, log: req.log }
      );
      return res.status(200).json(createResponse(sidebar, "success", 200, true, {
        total: sidebar.length,
        limit: sidebar.length,
        offset: 0
      }));
    } catch (error) {
      req.log?.error({ error: error.message }, "UserRouter.getUserSidebar_error");
      return res.status(500).json(createResponse(null, "Internal Server Error", 500));
    }
  };

  const getDetailUserParam = [param("id").isString().notEmpty()];
  const getDetailUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json(createResponse(null, "bad request", 400, false, {}, errors));
    req.log?.info({ id: req.params.id }, "UserRouter.getDetailUser");
    try {
      const user = await userUsecase.getUser(req.params.id, {
        requestId: req.requestId,
        log: req.log,
        roleName: req.auth.roleName,
      });
      if (!user) return res.status(404).json(createResponse(null, "User not found", 400));
      user.status = UserStatusIntToStr[user.status]
      return res.status(200).json(createResponse(user, "success", 200));
    } catch (error) {
      req.log?.error({ error: error.message }, "UserRouter.getDetailUser_error");
      return res.status(500).json(createResponse(null, "Internal Server Error", 500));
    }
  };

  const createUserParam = [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("name").isString().notEmpty(),
    body("phone").notEmpty().isString(),
    body("gender").notEmpty().isString().isIn(["male", "female"]),
    body("status")
      .optional()
      .isIn(["active", "inactive", "pending", "suspended"]),
    body("roleId").isInt().notEmpty(),
    body("assetIds").optional().isArray(),
  ];

  const createUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json(createResponse(null, "bad request", 400, false, {}, errors));
    req.log?.info({ email: req.body.email }, "UserRouter.createUser");
    try {
      const user = await userUsecase.createUser(req.body, {
        requestId: req.requestId,
        log: req.log,
        userId: req.auth.userId,
      });
      if (user === "exists")
        return res
          .status(409)
          .json(createResponse(null, "User with this email already exists", 409));
      return res.status(201).json(createResponse(user, "success", 201));
    } catch (error) {
      req.log?.error({ error: error.message }, "UserRouter.createUser_error");
      return res.status(500).json(createResponse(null, "Internal Server Error", 500));
    }
  };

  const updateUserParam = [
    param("id").isString().notEmpty(),
    body("email").optional().isEmail().normalizeEmail(),
    body("name").optional().isString().notEmpty(),
    body("gender").optional().isString().isIn(["male", "female"]),
    body("phone").optional().isString(),
    body("status")
      .optional()
      .isIn(["active", "inactive", "pending", "suspended"]),
    body("roleId").optional().isInt(),
    body("assetIds").optional().isArray(),
  ];

  const updateUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json(createResponse(null, "bad request", 400, false, {}, errors));
    try {
      req.log?.info({ id: req.params.id, body: req.body }, "UserRouter.updateUser");
      const updatedUser = await userUsecase.updateUser(
        req.params.id,
        req.body,
        {
          requestId: req.requestId,
          log: req.log,
          userId: req.auth.userId,
        }
      );
      if (!updatedUser)
        return res.status(404).json(createResponse(null, "User not found", 404 ));
      if (updatedUser === "exists")
        return res
          .status(409)
          .json(createResponse(null, "User with this email already exists", 409 ));
      return res.status(202).json(createResponse(updatedUser, "success", 202));
    } catch (error) {
      req.log?.error({ error: error.message }, "UserRouter.updateUser_error");
      return res.status(500).json(createResponse(null,   "Internal Server Error", 500 ));
    }
  };

  const getUserLogParam = [
    param("id").isString().notEmpty()
  ]

  const getUserLogs = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json(createResponse(null, "bad request", 400, false, {}, errors ));
    req.log?.info({ id: req.params.id }, "UserRouter.getUserLogs");
    try {
      const userLogs = await userUsecase.getUserLogs(req.params.id, {
        requestId: req.requestId,
        log: req.log,
        roleName: req.auth.roleName,
      });
      if (!userLogs) return res.status(404).json(createResponse(null, "User logs not found", 404));
      return res.status(200).json(createResponse(userLogs, "success", 200, true, {total: userLogs.length, limit: userLogs.length, offset: 0}));
    } catch (error) {
      req.log?.error({ error: error.message }, "UserRouter.getUserLogs");
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
  router.use(authMiddleware, ensureRole);

  // GET /api/users - List all users
  router.get("/", getUsers);
  // GET /api/users/permissions - Get current user permissions
  router.get("/permissions", getUserPermission);
  // GET /api/users/menus - Get user accessible menus
  router.get("/menus", getUserMenu);
  // GET /api/users/sidebar - Get user accessible sidebar
  router.get("/sidebar", getUserSidebar);
  // GET /api/users/:id - Get user by ID
  router.get("/:id", getDetailUserParam, getDetailUser);
  // POST /api/users - Create new user
  router.post("/", createUserParam, createUser);
  // PUT /api/users/:id - Update user
  router.put("/:id", updateUserParam, updateUser);
  router.get("/:id/logs", getUserLogParam, getUserLogs);

  // DELETE /api/users/:id - Delete user
  router.delete(
    "/:id",
    [param("id").isString().notEmpty()],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
      req.log?.info({ id: req.params.id }, "route_users_delete");
      try {
        const deleted = await userUsecase.deleteUser(req.params.id, {
          requestId: req.requestId,
          log: req.log,
          userId: req.auth.userId,
        });
        if (!deleted)
          return res.status(404).json({ message: "User not found" });
        if (deleted === "self")
          return res
            .status(400)
            .json({ message: "Cannot delete your own account" });
        return res.status(204).send();
      } catch (error) {
        req.log?.error({ error: error.message }, "route_users_delete_error");
        return res.status(500).json({ message: "Internal Server Error" });
      }
    }
  );

  return router;
}

module.exports = { InitUserRouter };
