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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatConsumer = void 0;
const jwt_config_1 = require("../jwt_config");
const ChatConsumer = (io) => __awaiter(void 0, void 0, void 0, function* () {
    let user;
    const chatNamespace = io.of('/chats');
    (0, jwt_config_1.socketAuthenticationDecorator)(chatNamespace);
    chatNamespace.on('connection', (socket) => {
        user = socket.user;
        console.log(socket.data);
        socket.join("chats");
        console.log(`A user: ${user === null || user === void 0 ? void 0 : user.first_name} connected to chat`);
        socket.on('disconnect', () => {
            console.log(`User: ${user === null || user === void 0 ? void 0 : user.first_name} disconnected from chat`);
        });
        socket.on('message', (data) => {
            console.log("");
            chatNamespace.to("chats").emit("message", data);
        });
    });
});
exports.ChatConsumer = ChatConsumer;
