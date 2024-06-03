import * as amqp from 'amqplib';
import {Consumer, ExchangeType, Queues, RabbitMQPayload} from "./consumer";
import {Connection, Channel} from "amqplib";
export class RabbitMQService{
    private exchange: ExchangeType;
    private queues: Queues[];
    private consumers: Consumer[];
    private connection?: Connection;
    private channel?:Channel ;

    constructor(exchange: ExchangeType, consumers: Consumer[]) {
        this.exchange = exchange;
        this.queues = consumers.map((consumer) => consumer.queue_name)
        this.consumers = consumers;
    }

    async connect(){
        let host = process.env.RABBIT_MQ_HOST
        let username = process.env.RABBIT_MQ_USERNAME
        let password = process.env.RABBIT_MQ_PASSWORD
        if (host === undefined || username == undefined || password == undefined){
            throw new Error("Rabbit MQ Settings are not complete")
        }

        this.connection = await amqp.connect(host, {
            username: username , password: password
        });
        this.channel = await this.connection.createChannel();
        await this.channel.assertExchange(this.exchange.name, this.exchange.type, {durable: true})
        for (const consumer of this.consumers) {
            await this.channel?.assertQueue(consumer.queue_name, {durable: true,
                arguments: {
        'x-queue-type': 'quorum'
    }},
                )
        }
        console.log("connected to rabbitmq")
        return this

        }


    async publish(queues: Queues[], data: RabbitMQPayload) {
        let body = JSON.stringify(data);
        let filtered_queues = queues.filter((queue)=>!(queue in this.queues))
        for (const queue of filtered_queues) {
            await this.channel?.bindQueue(queue, this.exchange.name, "")
        }

        this.channel?.publish(this.exchange.name, "", Buffer.from(body))

    }

    async consume(){
        for (const consumer of this.consumers){
            await this.channel?.bindQueue(consumer.queue_name, this.exchange.name, "");
            await this.channel?.consume(consumer.queue_name, (msg)=>{
                if (msg === null){
                    return null
                }
                consumer.handle_message(msg)
                this.channel?.ack(msg)
                return msg
                },
                {noAck: false });
        }
        console.log("listening for messages")

    }
}
