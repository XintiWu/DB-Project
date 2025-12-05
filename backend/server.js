import express from "express";
import cors from "cors";

import usersRoute from "./routes/users.js";
import requestsRoute from "./routes/requests.js";
import incidentsRoute from "./routes/incidents.js";
import rescueRequestRoute from "./routes/rescue_request.js";
import rescueSkillsRoute from "./routes/rescue_skills.js";
import rescueEquipmentsRoute from "./routes/rescue_equipments.js";
import requestAcceptsRoute from "./routes/request_accepts.js";
import itemsRoute from "./routes/items.js";
import itemCategoriesRoute from "./routes/item_categories.js";
import itemSuppliesRoute from "./routes/item_supplies.js";
import itemToolsRoute from "./routes/item_tools.js";
import inventoriesRoute from "./routes/inventories.js";
import inventoryItemsRoute from "./routes/inventory_items.js";
import inventoryOwnersRoute from "./routes/inventory_owners.js";
import providesRoute from "./routes/provides.js";
import lendsRoute from "./routes/lends.js";
import financialsRoute from "./routes/financials.js";
import sheltersRoute from "./routes/shelters.js";
import areaRoute from "./routes/area.js";
import skillTagsRoute from "./routes/skill_tags.js";
import analyticsRoute from "./routes/analytics.js";
import authRoute from "./routes/auth.js";
import warningsRoute from "./routes/warnings.js";

const app = express();
app.use(cors());
app.use(express.json());

// Root
app.get("/", (req, res) => {
  res.send("🚀 Full Disaster-Relief API is running!");
});

// Register routes
app.use("/api/auth", authRoute);
app.use("/api/users", usersRoute);
app.use("/api/requests", requestsRoute);
app.use("/api/incidents", incidentsRoute);
app.use("/api/rescue-request", rescueRequestRoute);
app.use("/api/rescue-skills", rescueSkillsRoute);
app.use("/api/rescue-equipments", rescueEquipmentsRoute);
app.use("/api/request-accepts", requestAcceptsRoute);
app.use("/api/items", itemsRoute);
app.use("/api/item-categories", itemCategoriesRoute);
app.use("/api/item-supplies", itemSuppliesRoute);
app.use("/api/item-tools", itemToolsRoute);
app.use("/api/inventories", inventoriesRoute);
app.use("/api/inventory-items", inventoryItemsRoute);
app.use("/api/inventory-owners", inventoryOwnersRoute);
app.use("/api/provides", providesRoute);
app.use("/api/lends", lendsRoute);
app.use("/api/financials", financialsRoute);
app.use("/api/shelters", sheltersRoute);
app.use("/api/area", areaRoute);
app.use("/api/skill-tags", skillTagsRoute);
app.use("/api/analytics", analyticsRoute);
app.use("/api/warnings", warningsRoute);

// 404 Logger & Handler
app.use((req, res, next) => {
  console.log(`[404] Resource not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Not Found' });
});

// Start
app.listen(3000, () => {
  console.log("🚀 Full API running at http://localhost:3000");
});
