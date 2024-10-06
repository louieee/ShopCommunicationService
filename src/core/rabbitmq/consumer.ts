import * as amqp from 'amqplib';
import {User} from "../../Repositories/user";
import {UserHandler} from "./handlers";
export interface RabbitMQPayload {
    action: string
    data_type: string
    data: string
}

export enum Queues{
    AccountQueue = "account_queue",
	InventoryQueue = "inventory_queue",
	ReportQueue = "report_queue",
	ChatQueue = "chat_queue",
	CRMQueue = "crm_queue",
    DefaultQueue = "default_queue"
}

export interface ExchangeType{
    name: string,
    type: "fanout"|"direct"
}
export const Exchange: ExchangeType = {name: "sales_app", type:"fanout"}

export class Consumer{
	queue_name = Queues.DefaultQueue
    handle_message(message: amqp.ConsumeMessage|null): boolean{
        if (message == null){
            return true;
        }
        console.log(" [x] Received '%s'", message.content.toString());
        return true;

    }
}

export class CommunicationConsumer extends Consumer{
    queue_name = Queues.ChatQueue
    handle_message(message: amqp.ConsumeMessage|null): boolean{
        if (message == null){
            return true;
        }
        let payload: RabbitMQPayload
        payload = JSON.parse(message.content.toString())
        switch (payload.data_type) {
            case "user": this.handle_user_actions(payload.action, payload.data);break;
            default:break;
        }
        return true;

    }

    handle_user_actions(action: string, data: string): boolean{
        switch (action){
            case "create":
                UserHandler.create(JSON.parse(data)).then((result)=>{
                    return result
                });
                break;
            case "delete":
                UserHandler.delete(JSON.parse(data)).then((result)=>{
                    return result
                });
                break;
            case "update":
                UserHandler.update(JSON.parse(data)).then((result)=>{
                    return result
                })
        }
        return true

    }
}

