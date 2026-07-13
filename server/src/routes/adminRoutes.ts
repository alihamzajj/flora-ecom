import { Router } from "express";
import { getAnalytics, getUsers, updateUserRole } from "../controllers/adminController.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";

const router = Router();

// Apply auth and authorize check to all admin routes
router.use(authenticate);

router.get("/analytics", authorize("admin", "manager"), getAnalytics);
router.get("/users", authorize("admin"), getUsers);
router.put("/users/:id/role", authorize("admin"), updateUserRole);

export default router;
