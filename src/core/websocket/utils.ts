import { io } from "socket.io-client";
import {User} from "../../Repositories/user";
import {create_access_token} from "../jwt_config";
import {UserType} from "../../schemas/user";



export async function send_ws(user:UserType|null, channel:string, channel_id:string|null, payload:any, event="message"){
    if (user === null){
        return;
    }
    const token = create_access_token(user);
    const websocket_host = process.env.WEBSOCKET_URL || 'ws://localhost:8000'
    let socket_url = `${websocket_host}/${channel}`
    if (channel_id){
        socket_url = `${socket_url}?channel_id=${channel_id}`
    }
    const socket = io(socket_url, {
    reconnectionDelayMax: 10000,
    auth: {
      token: token
    }
});
    const data = {"sender": user.id, "payload": payload}
    socket.emit(event, data)
    return;
}
