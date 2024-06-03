"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQ = void 0;
const client_1 = require("./client");
const consumer_1 = require("./consumer");
exports.RabbitMQ = new client_1.RabbitMQService(consumer_1.Exchange, [
    new consumer_1.CommunicationConsumer()
]);
