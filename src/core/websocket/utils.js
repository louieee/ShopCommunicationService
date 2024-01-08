"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.send_ws = void 0;
const socket_io_client_1 = require("socket.io-client");
const jwt_config_1 = require("../jwt_config");
function send_ws(user, channel, payload) {
    if (user === null) {
        return;
    }
    const token = (0, jwt_config_1.create_access_token)(user);
    const websocket_url = process.env.WEBSOCKET_URL || 'ws://localhost:8000';
    const socket = (0, socket_io_client_1.io)(`${websocket_url}/${channel}`, {
        reconnectionDelayMax: 10000,
        auth: {
            token: token
        }
    });
    const data = { "sender": user.id, "payload": payload };
    socket.emit("message", data);
    return;
}
exports.send_ws = send_ws;
