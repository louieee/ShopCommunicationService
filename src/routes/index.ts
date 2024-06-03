import express from "express";
import PingView from "../views/user";
import {jwtAuthentication} from "../core/jwt_config";
import ChatView from "../views/chats";
import {CustomResponse} from "../core/utils";
import UserView from "../views/user";

const router = express.Router();

router.get("/users/token",  async (_req, res) => {
  const controller = new UserView();
  const response = await controller.getUserToken(_req)
  return res.status(response.status).json({...response})
});


const authRouter = router.use(jwtAuthentication)

authRouter.get("/users",  async (_req, res) => {
  const controller = new UserView();
  const response = await controller.getUsers(_req)
  return res.status(response.status).json({...response})
});

authRouter.post("/chats", async (_req:any, res)=>{
  const controller = new ChatView();
  const response=  await controller.createChat(_req.body, _req)
  return res.status(response.status).json({...response})
});


authRouter.post("/chats/groups", async (_req, res)=>{
  const controller = new ChatView();
  const response=  await controller.createGroup(_req.body, _req)
  return res.status(response.status).json({...response})
});

authRouter.put("/chats/:id", async (_req, res)=>{
  const controller = new ChatView();
  const response=  await controller.updateChat(_req.params.id, _req.body, _req)
  return res.status(response.status).json({...response})
});

authRouter.delete("/chats/:id", async (_req, res)=>{
  const controller = new ChatView();
  const response=  await controller.deleteChat(_req.params.id,  _req)
  return res.status(response.status).json({...response})
});

authRouter.get("/chats", async (_req, res)=>{
  const controller = new ChatView();
  const pageNumber = _req.query.page_number ? parseInt(_req.query.page_number.toString()) : 1;
  const pageSize = _req.query.page_size ? parseInt(_req.query.page_size.toString()) : 10;

  const response=  await controller.listChat(_req, pageNumber, pageSize)
  return res.status(response.status).json({...response})
});

authRouter.get("/chats/:id", async (_req, res)=>{
  const controller = new ChatView();
  const response=  await controller.retrieveChat(_req.params.id,  _req)
  return res.status(response.status).json({...response})
});

authRouter.post("/chats/:id/messages", async (_req, res)=>{
  const controller = new ChatView();
  const response=  await controller.createMessage(_req.params.id, _req.body, _req)
  return res.status(response.status).json({...response})
});

authRouter.get("/chats/:id/messages", async (_req, res)=>{
  const controller = new ChatView();
  const pageNumber = _req.query.page_number ? parseInt(_req.query.page_number.toString()) : 1;
  const pageSize = _req.query.page_size ? parseInt(_req.query.page_size.toString()) : 10;
  const response=  await controller.listMessage(_req.params.id, _req, pageNumber, pageSize)
  return res.status(response.status).json({...response})
});

authRouter.delete("/chats/messages/:id", async (_req, res)=>{
  const controller = new ChatView();
  const response=  await controller.deleteMessage(_req.params.id,  _req)
  return res.status(response.status).json({...response})
});

authRouter.put("/chats/messages/:id", async (_req, res)=>{
  const controller = new ChatView();
  const response=  await controller.updateMessage(_req.params.id, _req.body, _req)
  return res.status(response.status).json({...response})
});

authRouter.delete("/chats/messages/attachments", async (_req, res)=>{
  const controller = new ChatView();
  const response=  await controller.deleteMessageAttachments(_req.body, _req)
  return res.status(response.status).json({...response})
});



export default router;