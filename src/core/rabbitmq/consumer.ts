import * as amqp from 'amqplib';
export interface RabbitMQPayload {
    action: string
    type: string
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
    handle_message(message: amqp.ConsumeMessage|null){
        if (message == null){
            return;
        }
        console.log(" [x] Received '%s'", message.content.toString());
        return message;

    }
}

export class CommunicationConsumer extends Consumer{
    queue_name = Queues.ChatQueue
    handle_message(message: amqp.ConsumeMessage|null){
        if (message == null){
            return;
        }
        console.log(" [x] Received '%s'", JSON.parse(message.content.toString()));
        return message;

    }
}

