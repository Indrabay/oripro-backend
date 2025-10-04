const { Router } = require("express");
const { body, validationResult, param } = require("express-validator");
const { authMiddleware, ensureRole } = require("../middleware/auth");

function InitUserRouter(userUsecase, userAccessMenuUsecase) {
  const router = Router();
  const getUsers = async (req, res) => {
    req.log?.info({}, "route_users_list");
    try {
      const users = await userUsecase.listUsers({
        requestId: req.requestId,
        log: req.log,
        roleName: req.auth.roleName,
      });
      if (users === "forbidden")
        return res.status(403).json({ message: "Admin cannot list all users" });
      return res.json(users);
    } catch (error) {
      req.log?.error(
        { error: error.message, stack: error.stack },
        "route_users_list_error"
      );

      return res.status(500).json({
        message: "Internal Server Error",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  };
  const getUserPermission = async (req, res) => {
    req.log?.info({ userId: req.auth.userId }, "route_users_permissions");
    try {
      const permissions = await userUsecase.getUserPermissions(
        req.auth.userId,
        {
          requestId: req.requestId,
          log: req.log,
        }
      );
      return res.json({ permissions });
    } catch (error) {
      req.log?.error({ error: error.message }, "route_users_permissions_error");
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };

  const getUserMenu = async (req, res) => {
    req.log?.info({ userId: req.auth.userId }, "route_users_menus");
    try {
      const menus = await userAccessMenuUsecase.getUserAccessibleMenus(
        req.auth.userId,
        { requestId: req.requestId, log: req.log }
      );
      return res.json({ menus });
    } catch (error) {
      req.log?.error({ error: error.message }, "route_users_menus_error");
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };

  const getUserSidebar = async (req, res) => {
    req.log?.info({ userId: req.auth.userId }, "route_users_sidebar");
    try {
      const sidebar = await userAccessMenuUsecase.getUserSidebarData(
        req.auth.userId,
        { requestId: req.requestId, log: req.log }
      );
      return res.json(sidebar);
    } catch (error) {
      req.log?.error({ error: error.message }, "route_users_sidebar_error");
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };

  const getDetailUserParam = [param("id").isString().notEmpty()];
  const getDetailUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    req.log?.info({ id: req.params.id }, "route_users_get");
    try {
      const user = await userUsecase.getUser(req.params.id, {
        requestId: req.requestId,
        log: req.log,
        roleName: req.auth.roleName,
      });
      if (!user) return res.status(404).json({ message: "User not found" });
      return res.json(user);
    } catch (error) {
      req.log?.error({ error: error.message }, "route_users_get_error");
      return res.status(500).json({ message: "Internal Server Error" });
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
  ];

  const createUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    req.log?.info({ email: req.body.email }, "route_users_create");
    try {
      const user = await userUsecase.createUser(req.body, {
        requestId: req.requestId,
        log: req.log,
        userId: req.auth.userId,
      });
      if (user === "exists")
        return res
          .status(409)
          .json({ message: "User with this email already exists" });
      return res.status(201).json(user);
    } catch (error) {
      req.log?.error({ error: error.message }, "route_users_create_error");
      return res.status(500).json({ message: "Internal Server Error" });
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
    body("roleId").optional().isInt().notEmpty(),
  ];

  const updateUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    req.log?.info({ id: req.params.id }, "route_users_update");
    try {
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
        return res.status(404).json({ message: "User not found" });
      if (updatedUser === "exists")
        return res
          .status(409)
          .json({ message: "User with this email already exists" });
      return res.json(updatedUser);
    } catch (error) {
      req.log?.error({ error: error.message }, "route_users_update_error");
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };
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
