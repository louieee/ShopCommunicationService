import {User} from "../../Repositories/user";

export class UserHandler{


    static create = async (data: any)=>{
        try{
            console.log("creating user")
            await User.create({user_id: Number.parseInt(data.id), email: data.email, first_name: data.first_name,
            last_name: data.last_name})
            return true
        }catch (e){
            console.log(e)
            console.log("an error occurred creating user")
            return false
        }

    }

    static  delete = async(data: any)=>{
        try{
            await User.delete(Number.parseInt(data.id))
            return true
        }catch (e){
            return false
        }

    }

    static update = async(data: any)=>{
        try{
            await User.update(Number.parseInt(data.id), {user_id: Number.parseInt(data.id), email: data.email, first_name: data.first_name,
            last_name: data.last_name})
            return true
        }catch (e){
            return false
        }

    }

}
