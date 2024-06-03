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
const chat_1 = require("../../Repositories/chat");
const ChatConsumer = (io) => __awaiter(void 0, void 0, void 0, function* () {
    let user;
    let room;
    const chatNamespace = io.of('/chats/');
    yield (0, jwt_config_1.socketAuthenticationDecorator)(chatNamespace);
    const userNamespace = io.of('/users');
    yield (0, jwt_config_1.socketAuthenticationDecorator)(userNamespace);
    chatNamespace.on('connection', (socket) => {
        user = socket.user;
        if (!user) {
            socket.disconnect();
            return;
        }
        const { channel_id } = socket.handshake.query;
        if (!channel_id) {
            socket.disconnect();
            return;
        }
        if (typeof (channel_id) !== "string") {
            socket.disconnect();
            return;
        }
        if (chat_1.Chat.retrieve(channel_id, user.id) === null) {
            socket.disconnect();
            return;
        }
        room = `chat-${channel_id}`;
        socket.join(room);
        console.log(`A user: ${user === null || user === void 0 ? void 0 : user.first_name} connected to ${room}`);
        socket.on('disconnect', () => {
            console.log(`User: ${user === null || user === void 0 ? void 0 : user.first_name} disconnected from chat`);
        });
        socket.on('message', (data) => {
            console.log("");
            socket.broadcast.to(room).emit('message', data);
        });
    });
    userNamespace.on('connection', (socket) => {
        user = socket.user;
        console.log(socket.data);
        room = `users-${user}`;
        socket.join(room);
        socket.join("general");
        console.log(`A user: ${user === null || user === void 0 ? void 0 : user.first_name} connected to private channel`);
        socket.on('disconnect', () => {
            console.log(`User: ${user === null || user === void 0 ? void 0 : user.first_name} disconnected from their private channel`);
        });
        socket.on('message', (data) => {
            console.log("message: ", data);
            userNamespace.to(room).emit("message", data);
        });
        socket.on("log", (data) => {
            console.log("log: ", data);
            socket.to("general").emit("log", data);
        });
    });
});
exports.ChatConsumer = ChatConsumer;
