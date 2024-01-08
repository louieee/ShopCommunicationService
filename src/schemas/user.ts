
export interface UserType{
    id: number,
    first_name: string,
    last_name: string,
    email:string
}

export class User{
    id: number|null
    first_name: string | null
    last_name: string | null
    email:string

    constructor(first_name:string, last_name:string, email:string) {
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
        this.id = 1
    }

    // getChannels = ()=>{
    //     return ["general", `user-${this.id}`]
    // }
}

export interface CreateUser{
    first_name: string,
    last_name: string,
    email_name: string,
    password: string
}