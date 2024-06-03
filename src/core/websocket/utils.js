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
exports.send_ws = void 0;
const socket_io_client_1 = require("socket.io-client");
const jwt_config_1 = require("../jwt_config");
function send_ws(user_1, channel_1, channel_id_1, payload_1) {
    return __awaiter(this, arguments, void 0, function* (user, channel, channel_id, payload, event = "message") {
        if (user === null) {
            return;
        }
        const token = (0, jwt_config_1.create_access_token)(user);
        const websocket_host = process.env.WEBSOCKET_URL || 'ws://localhost:8000';
        let socket_url = `${websocket_host}/${channel}`;
        if (channel_id) {
            socket_url = `${socket_url}?channel_id=${channel_id}`;
        }
        const socket = (0, socket_io_client_1.io)(socket_url, {
            reconnectionDelayMax: 10000,
            auth: {
                token: token
            }
        });
        const data = { "sender": user.id, "payload": payload };
        socket.emit(event, data);
        return;
    });
}
exports.send_ws = send_ws;
