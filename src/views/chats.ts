import {
    Get,
    Route,
    Security,
    Request,
    Controller,
    Post,
    Body,
    Response,
    Patch,
    Put,
    Path,
    Delete,
    Query,
    Tags
} from "tsoa";
import express from "express";
import {db_client} from "../core/database";
import {client} from "../core/celery/client";
import {send_ws} from "../core/websocket/utils";
import {User} from "../Repositories/user";
import {CreateChat, CreateGroup, CreateMessage, UpdateChat, UpdateMessage} from "../schemas/chat";
import {Chat, Message} from "../Repositories/chat";
import {CustomResponse} from "../core/utils";




@Route("chats")
@Tags("chats")
@Security("api_key")
export default class ChatView extends Controller{

/** @summary endpoint to create a chat */
  @Post('/')
  public async createChat(@Body() data: CreateChat, @Request() req: any):Promise<CustomResponse> {
    let user = req.user
    try{
      const result = await Chat.create_chat(user.id, data.recipient_id)
       await send_ws(user, "chats", result?.id, {"event": "New Chat", data: result})
      return {message: "Chat created successfully",
          data: result, status: 201};
      }catch(err){
      return {message: err, status: 400, data: null}
    }
  }

/** @summary endpoint to create a group */
  @Post('/groups')
  public async createGroup(@Body() data: CreateGroup, @Request() req: any):Promise<CustomResponse> {
    let user = req.user;
    try{
      const result = await Chat.create_group(user.id, data);
       await send_ws(user, "chats", result.id, {"event": "New Group", data: result})
      return {message: "Group created successfully",
          data: result, status: 201};
      }catch(err){
        console.log(err)
      return {message: err, status: 400, data: null}
    }
  }

  /** @summary endpoint to update a group */
  @Put('/:id')
  public async updateChat(@Path() id: string, @Body() data: UpdateChat, @Request() req: any): Promise<CustomResponse> {
    let user = req.user;
    try{
      const result = await Chat.update(id, user.id, data)
      await send_ws(user, "chats", id, {"event": "Updated Group", data: result})
      return {message: "Group updated successfully",
          data: result, status: 200};
      }catch(err){
      console.log(err);
      return {message: err, status: 400, data: null}
    }
  }
/** @summary endpoint to update a group */
  @Delete ('/:id')
  public async deleteChat(@Path() id: string, @Request() req: any): Promise<CustomResponse> {
    let user = req.user;
    try{
      const result = await Chat.delete(id, user.id)
      await send_ws(user, "chats", null, {"event": "Delete Group", data: result})
      return {message: "Group deleted successfully",
          data: result, status: 204};
      }catch(err){
      console.log(err);
      return {message: err, status: 400, data: null}
    }
  }
/** @summary endpoint to retrieve list of chats
 *
 * */

  @Get('/')
  public async listChat(@Request() req: any, @Query() page=1, @Query() page_size=10): Promise<CustomResponse> {
    try {
        const user = req.user;
        const result = await Chat.list(user.id, page, page_size);

        return {
            message: "Chats retrieved successfully",
            data: result,
            status: 200
        };
    } catch (err) {
        console.error(err);
        return {
            message: err|| "Error retrieving chats",
            status: 400,
            data: null
        };
    }
}
/** @summary endpoint to retrieve a chat */
  @Get('/:id')
  public async retrieveChat(@Path() id: string,@Request() req: any): Promise<CustomResponse> {
    try {
        const user = req.user;
        const result = await Chat.retrieve(id, user.id);

        return {
            message: "Chat retrieved successfully",
            data: result,
            status: 200
        };
    } catch (err) {
        console.error(err);
        return {
            message: err|| "Error retrieving chats",
            status: 400,
            data: null
        };
    }
}

/** @summary endpoint to send message to a chat */
  @Post('/:id/messages')
  public async createMessage(@Path() id: string, @Body() data: CreateMessage, @Request() req: any): Promise<CustomResponse> {
    try {
        const user = req.user;
        const result = await Message.create(id, user.id, data);
        const user_data = await Chat.participants(id);
        if (user_data && user_data.participants.length > 0)
        for (let p in user_data.participants){
            let obj_user = user_data.participants[parseInt(p)]
            await send_ws(obj_user, "users", null, {"event": "New Message", "payload": result} )

        }
        await send_ws(user, "chats", id, {"event": "New Message", "payload": result})



        return {
            message: "Chat message sent successfully",
            data: result,
            status: 201
        };
    } catch (err) {
        console.error(err);
        return {
            message: err|| "Error sending message",
            status: 400,
            data: null
        };
    }
}


/** @summary endpoint to retrieve all messages in a chat */
  @Get('/:id/messages')
  public async listMessage(@Path() id: string, @Request() req: any, @Query() page=1, @Query() page_size=10): Promise<CustomResponse> {
    try {
        const user = req.user;
        const result = await Message.list(id, user.id, page, page_size);

        return {
            message: "Chat message list retrieved successfully",
            data: result,
            status: 201
        };
    } catch (err) {
        console.error(err);
        return {
            message: err|| "Error retrieving chat messages",
            status: 400,
            data: null
        };
    }
}

/** @summary endpoint to delete a message in a chat */
    @Delete('/messages/:id')
  public async deleteMessage(@Path() id: string, @Request() req: any): Promise<CustomResponse> {
    try {
        const user = req.user;
        const result = await Message.delete(id, user.id);

        return {
            message: "Chat message deleted successfully",
            data: result,
            status: 204
        };
    } catch (err) {
        console.error(err);
        return {
            message: err|| "Error deleting message",
            status: 400,
            data: null
        };
    }
}

/** @summary endpoint to update a message in a chat */
    @Put('/messages/:id')
  public async updateMessage(@Path() id: string, @Body() data: UpdateMessage, @Request() req: any): Promise<CustomResponse> {
    try {
        const user = req.user;
        const result = await Message.update(id, user.id, data);

        return {
            message: "Chat message updated successfully",
            data: result,
            status: 200
        };
    } catch (err) {
        console.error(err);
        return {
            message: err|| "Error updating message",
            status: 400,
            data: null
        };
    }
}

/** @summary endpoint to delete message attachments in a chat */
    @Delete('/messages/attachments')
  public async deleteMessageAttachments(@Body() attachment_ids: string[], @Request() req: any): Promise<CustomResponse> {
    try {
        const user = req.user;
        const result = await Message.deleteAttachments(user.id, attachment_ids);

        return {
            message: "Chat message attachments deleted successfully",
            data: result,
            status: 200
        };
    } catch (err) {
        console.error(err);
        return {
            message: err|| "Error deleting message attachments",
            status: 400,
            data: null
        };
    }
}



}
