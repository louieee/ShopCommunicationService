// src/sockets.ts
import { Server, Socket } from 'socket.io';
import {User} from "../../schemas/user";
import {AuthenticatedSocket, socketAuthenticationDecorator} from "../jwt_config";

export const ChatConsumer = async (io: Server) => {
  let user: User | undefined;
  const chatNamespace = io.of('/chats');
  socketAuthenticationDecorator(chatNamespace)

  chatNamespace.on('connection', (socket: AuthenticatedSocket) => {
    user = socket.user;
    console.log(socket.data)
    socket.join("chats")
    console.log(`A user: ${user?.first_name} connected to chat`);


    socket.on('disconnect', () => {
      console.log(`User: ${user?.first_name} disconnected from chat`);
    });

    socket.on('message', (data: any) => {
        console.log("")
        chatNamespace.to("chats").emit("message", data)
    });
  });
};