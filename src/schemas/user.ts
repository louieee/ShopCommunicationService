import {db_client} from "../core/database";


export interface BaseUserType{
    first_name: string | null,
    last_name: string | null,
    email:string
}

export interface TokenUserPayload
{
    id: number
    user_id: number
    user_type: "Administrator" | "Staff" | "Customer"
    first_name: string
    last_name: string
    email: string
}

export interface UserType extends BaseUserType{
    id: string
    user_id: number
}

export interface UserListType extends BaseUserType{
    id : string
    profile_pic: string|null
}




    // getChannels = ()=>{
    //     return ["general", `user-${this.id}`]
    // }


export interface CreateUser extends BaseUserType{
    password: string
}

export interface UserDetailType extends UserListType{
    role : string
    created_at: Date
    updated_at : Date
}