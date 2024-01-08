import express from "express";
import PingView from "../views/ping";

const router = express.Router();

router.get("/ping",  async (_req, res) => {
  const controller = new PingView();
  const response = await controller.getMessage(_req)
  return res.send(response);
});

export default router;