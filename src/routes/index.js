"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jwt_config_1 = require("../core/jwt_config");
const chats_1 = __importDefault(require("../views/chats"));
const user_1 = __importDefault(require("../views/user"));
const router = express_1.default.Router();
router.get("/users/token", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const controller = new user_1.default();
    const response = yield controller.getUserToken(_req);
    return res.status(response.status).json(Object.assign({}, response));
}));
const authRouter = router.use(jwt_config_1.jwtAuthentication);
authRouter.get("/users", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const controller = new user_1.default();
    const response = yield controller.getUsers(_req);
    return res.status(response.status).json(Object.assign({}, response));
}));
authRouter.post("/chats", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const controller = new chats_1.default();
    const response = yield controller.createChat(_req.body, _req);
    return res.status(response.status).json(Object.assign({}, response));
}));
authRouter.post("/chats/groups", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const controller = new chats_1.default();
    const response = yield controller.createGroup(_req.body, _req);
    return res.status(response.status).json(Object.assign({}, response));
}));
authRouter.put("/chats/:id", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const controller = new chats_1.default();
    const response = yield controller.updateChat(_req.params.id, _req.body, _req);
    return res.status(response.status).json(Object.assign({}, response));
}));
authRouter.delete("/chats/:id", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const controller = new chats_1.default();
    const response = yield controller.deleteChat(_req.params.id, _req);
    return res.status(response.status).json(Object.assign({}, response));
}));
authRouter.get("/chats", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const controller = new chats_1.default();
    const pageNumber = _req.query.page_number ? parseInt(_req.query.page_number.toString()) : 1;
    const pageSize = _req.query.page_size ? parseInt(_req.query.page_size.toString()) : 10;
    const response = yield controller.listChat(_req, pageNumber, pageSize);
    return res.status(response.status).json(Object.assign({}, response));
}));
authRouter.get("/chats/:id", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const controller = new chats_1.default();
    const response = yield controller.retrieveChat(_req.params.id, _req);
    return res.status(response.status).json(Object.assign({}, response));
}));
authRouter.post("/chats/:id/messages", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const controller = new chats_1.default();
    const response = yield controller.createMessage(_req.params.id, _req.body, _req);
    return res.status(response.status).json(Object.assign({}, response));
}));
authRouter.get("/chats/:id/messages", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const controller = new chats_1.default();
    const pageNumber = _req.query.page_number ? parseInt(_req.query.page_number.toString()) : 1;
    const pageSize = _req.query.page_size ? parseInt(_req.query.page_size.toString()) : 10;
    const response = yield controller.listMessage(_req.params.id, _req, pageNumber, pageSize);
    return res.status(response.status).json(Object.assign({}, response));
}));
authRouter.delete("/chats/messages/:id", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const controller = new chats_1.default();
    const response = yield controller.deleteMessage(_req.params.id, _req);
    return res.status(response.status).json(Object.assign({}, response));
}));
authRouter.put("/chats/messages/:id", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const controller = new chats_1.default();
    const response = yield controller.updateMessage(_req.params.id, _req.body, _req);
    return res.status(response.status).json(Object.assign({}, response));
}));
authRouter.delete("/chats/messages/attachments", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const controller = new chats_1.default();
    const response = yield controller.deleteMessageAttachments(_req.body, _req);
    return res.status(response.status).json(Object.assign({}, response));
}));
exports.default = router;
