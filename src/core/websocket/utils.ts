import { io } from "socket.io-client";
import {User} from "../../schemas/user";
import {create_access_token} from "../jwt_config";



export function send_ws(user:User|null, channel:string, payload:any){
    if (user === null){
        return;
    }
    const token = create_access_token(user);
    const websocket_url = process.env.WEBSOCKET_URL || 'ws://localhost:8000'
    const socket = io(`${websocket_url}/${channel}`, {
    reconnectionDelayMax: 10000,
    auth: {
      token: token
    }
});
    const data = {"sender": user.id, "payload": payload}
    socket.emit("message", data)
    return;
}
