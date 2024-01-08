import {Get, Route, Security, Request, Controller} from "tsoa";
import express from "express";
import {db_client} from "../core/database";
import {client} from "../core/celery/client";
import {send_ws} from "../core/websocket/utils";
import {User} from "../schemas/user";



interface PingResponse {
  message: string;
  data: any
}

@Route("ping")
export default class PingView extends Controller{
  /** @summary endpoint to ping the request */
  @Get('/')
  @Security('api_key')
  public async getMessage(@Request() req: express.Request): Promise<PingResponse> {
    const allUsers = await db_client.user.findMany();
    const task = client.createTask("tasks.add");
    const result = task.applyAsync([1, 2]);
    result.get().then(data => {
      console.log(data);
      // client.disconnect().then(r => console.log("Celery client disconnected"));
    });
    const user = allUsers[0]
    console.log("user: ", user)
    send_ws(user, "chats", {"message": "good morning"})
    return {
      message: "users retrieved",
      data: allUsers
    }
  }
}
