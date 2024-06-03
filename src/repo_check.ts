import {db_client} from "./core/database";
import bcrypt from 'bcrypt';
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}
async function query() {

}
query().catch(e=> {
    console.log(e.message)
}).finally(
    async ()=>{
        db_client.$disconnect()
    }
)