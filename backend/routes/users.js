import express from "express";
import { createBaseController } from "../controllers/baseController.js";

const router = express.Router();
const controller = createBaseController("USERS", "user_id");

router.get("/", controller.getAll);
router.get("/:id", controller.getOne);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

export default router;
