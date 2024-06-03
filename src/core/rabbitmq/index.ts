import {RabbitMQService} from "./client";
import {Exchange, CommunicationConsumer} from "./consumer";


export const RabbitMQ = new RabbitMQService(
    Exchange,
    [
        new CommunicationConsumer()
    ]
)