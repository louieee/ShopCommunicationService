// src/sockets.ts
import { Server, Socket } from 'socket.io';
import {User} from "../../Repositories/user";
import {AuthenticatedSocket, socketAuthenticationDecorator} from "../jwt_config";
import {Chat} from "../../Repositories/chat";

export const ChatConsumer = async (io: Server) => {
  let user: User | undefined;
  let room: string
  const chatNamespace = io.of('/chats/');
  await socketAuthenticationDecorator(chatNamespace)
  const userNamespace = io.of('/users');
  await socketAuthenticationDecorator(userNamespace)
  chatNamespace.on('connection', (socket: AuthenticatedSocket) => {
    user = socket.user;
    if (!user){
      socket.disconnect()
      return;
    }
    const { channel_id } = socket.handshake.query
    if (!channel_id){
      socket.disconnect()
      return;
    }
    if (typeof(channel_id) !== "string"){
      socket.disconnect()
      return;
    }
    if (Chat.retrieve(channel_id, user.id) === null){
      socket.disconnect()
      return;
    }
    room = `chat-${channel_id}`
    socket.join(room)
    console.log(`A user: ${user?.first_name} connected to ${room}`);


    socket.on('disconnect', () => {
      console.log(`User: ${user?.first_name} disconnected from chat`);
    });

    socket.on('message', (data) => {
    console.log("");
    socket.broadcast.to(room).emit('message', data);
});
  });

  userNamespace.on('connection', (socket: AuthenticatedSocket) => {
    user = socket.user;
    console.log(socket.data)
    room  = `users-${user}`
    socket.join(room)
    socket.join("general")
    console.log(`A user: ${user?.first_name} connected to private channel`);


    socket.on('disconnect', () => {
      console.log(`User: ${user?.first_name} disconnected from their private channel`);
    });

    socket.on('message', (data: any) => {
        console.log("message: ", data)
        userNamespace.to(room).emit("message", data)
    });
    socket.on("log", (data: any)=>{
      console.log("log: ", data)
      socket.to("general").emit("log", data)
    })
  });
};


