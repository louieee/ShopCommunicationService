import {Get, Route, Security, Request, Controller, Tags} from "tsoa";
import express from "express";
import {db_client} from "../core/database";
import {client} from "../core/celery/client";
import {send_ws} from "../core/websocket/utils";
import {User} from "../Repositories/user";
import {create_access_token} from "../core/jwt_config";
import {CustomRequest, CustomResponse} from "../core/utils";



interface PingResponse {
  message: string;
  data: any
}

@Route("users")
@Tags("users")
export default class UserView extends Controller{
  /** @summary endpoint to retrieve a user's token */
  @Get('/token')
  @Security("api_key")
  public async getUserToken(@Request() req: express.Request): Promise<CustomResponse> {
    const user = await db_client.user.findFirst({
      orderBy: {
        id: "desc"
      }
    });
    // const task = client.createTask("tasks.add");
    // const result = task.applyAsync([1, 2]);
    // result.get().then(data => {
    //   console.log(data);
    //   // client.disconnect().then(r => console.log("Celery client disconnected"));
    // });
    if (!user){
      return {
        message: "No User at this moment",
        data: user,
        status: 200
      }
    }
    console.log("user: ", user)
    await send_ws(user, "chats",  null,{"message": "good morning"}, "log")
    return {
      message: "user token retrieved",
      data: create_access_token(user, null),
      status: 200
    }
  }

  /** @summary endpoint to retrieve a users */
  @Get('/')
  @Security("api_key")
  public async getUsers(@Request() req: any): Promise<CustomResponse> {
    const user = req.user
    const users = await db_client.user.findMany({
      orderBy: {
        id: "desc"
      },
      where: {
        id: {
          not: user.id
        }
      }
    });
    if (users.length == 0){
      return {
        message: "No User at this moment",
        data: users,
        status: 200
      }
    }
    await send_ws(user, "users", null, {"message": "good morning"}, "log")
    return {
      message: "users retrieved",
      data: users,
      status: 200
    }
  }
}
