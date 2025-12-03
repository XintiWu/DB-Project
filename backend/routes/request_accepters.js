import express from "express";
import { createBaseController } from "../controllers/baseController.js";

const router = express.Router();
const c = createBaseController("REQUEST_ACCEPTERS", "accepter_id");

router.get("/", c.getAll);
router.get("/:id", c.getOne);
router.post("/", c.create);
router.put("/:id", c.update);
router.delete("/:id", c.remove);

export default router;
