/**
 *  Admin User can create a group chat
 * Users can start a chat with another user
 * Users can join a chat
 * Users can chat
 * Users can do video calls
 **/
import {UserListType} from "./user";
import {db_client} from "../core/database";

export interface AttachmentType{
    file_type: FileType
    file:string
}


enum GroupType {
  ADMIN_GROUP= "admin group",
  CUSTOMER_GROUP = "customer group"
}

enum SeenStatus {
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read"
}


enum Role{
    CUSTOMER = "customer",
    ADMIN = "admin"
}

enum FileType {
  IMAGE = "image",
  AUDIO = "audio",
  VIDEO = "video",
  FILE = "file"
}


export interface CreateGroup{
        name: string,
        type: GroupType,
        description: string,
        participant_ids: string[]
}

export interface CreateChat{
    recipient_id: string
}

export interface UpdateChat{
    participant_ids: string[]|undefined
    description : string|undefined


}

export interface CreateMessage{
    content: string,
    attachments: AttachmentType[]|undefined
}

export interface UpdateMessage{
    status: SeenStatus|undefined,
    content: string|undefined
}