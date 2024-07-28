import {db_client} from "../core/database";
import {BaseUserType, UserDetailType, UserListType, UserType} from "../schemas/user";

export class User implements BaseUserType{

    constructor(first_name:string, last_name:string, email:string) {
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
        this.id = ""
    }

    email: string;
    first_name: string | null;
    id: string;
    last_name: string | null;

   static async retrieve(id:string, list:boolean):Promise<UserListType|UserDetailType|null>{
        let user = await db_client.user.findFirst({
        where:{id: id}
    })
       if (user === null){
           return null
       }
       let user_item = {id: user.id, first_name: user.first_name, last_name:user.last_name, email: user.email,
           profile_pic: user.profile_pic}
       if (list){
           return user_item
       }else{
            return {...user_item, role: user.role, created_at: user.created_at, updated_at: user.updated_at }
       }
   }

   static async retrieve_by_user_id(user_id:number):Promise<UserType|null>{
       let user: UserType|null = null;
       user = await db_client.user.findFirst({where: {user_id: user_id},
       select:{id: true, user_id:true, first_name:true, last_name:true, email:true}});
       console.log("user: ", user)
       if (user !== null){
           return user
       }
       return user
   }
   static async list(ids: string[] | undefined):Promise<UserListType[]>{
        let users
       if (ids !== undefined){
        users = await db_client.user.findMany({
            where:{id: {in: ids}}
        })
    }else{
        users = await db_client.user.findMany()
    }
    return users
}


    static async create(data: {"first_name": string, "last_name": string, "email": string, "user_id": number}){
        return db_client.user.create({data: {...data, password: ""}});
    }

    static async update(user_id: number, data: {"first_name": string, "last_name": string, "email": string, "user_id": number}){
      let user = await db_client.user.findFirst({where: {user_id: user_id},
       select:{id: true}});
      if (!user){
          return false
      }
        return db_client.user.update({
            where: {id: user.id},
            data: data,
        });

    }

    static async delete(user_id: number){
       let user = await db_client.user.findFirst({where: {user_id: user_id},
       select:{id: true}});
      if (!user){
          return false
      }
        return db_client.user.delete({
            where: {id: user.id}
        });

    }





}

