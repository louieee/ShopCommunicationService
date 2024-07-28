"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQService = void 0;
const amqp = __importStar(require("amqplib"));
class RabbitMQService {
    constructor(exchange, consumers) {
        this.exchange = exchange;
        this.queues = consumers.map((consumer) => consumer.queue_name);
        this.consumers = consumers;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            let host = process.env.RABBIT_MQ_HOST;
            let username = process.env.RABBIT_MQ_USERNAME;
            let password = process.env.RABBIT_MQ_PASSWORD;
            if (host === undefined || username == undefined || password == undefined) {
                throw new Error("Rabbit MQ Settings are not complete");
            }
            this.connection = yield amqp.connect(host, {
                username: username, password: password
            });
            this.channel = yield this.connection.createChannel();
            yield this.channel.assertExchange(this.exchange.name, this.exchange.type, { durable: true });
            for (const consumer of this.consumers) {
                yield ((_a = this.channel) === null || _a === void 0 ? void 0 : _a.assertQueue(consumer.queue_name, { durable: true,
                    arguments: {
                        'x-queue-type': 'quorum'
                    } }));
            }
            console.log("connected to rabbitmq");
            return this;
        });
    }
    publish(queues, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            let body = JSON.stringify(data);
            let filtered_queues = queues.filter((queue) => !(queue in this.queues));
            for (const queue of filtered_queues) {
                yield ((_a = this.channel) === null || _a === void 0 ? void 0 : _a.bindQueue(queue, this.exchange.name, ""));
            }
            (_b = this.channel) === null || _b === void 0 ? void 0 : _b.publish(this.exchange.name, "", Buffer.from(body));
        });
    }
    consume() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            for (const consumer of this.consumers) {
                yield ((_a = this.channel) === null || _a === void 0 ? void 0 : _a.bindQueue(consumer.queue_name, this.exchange.name, ""));
                yield ((_b = this.channel) === null || _b === void 0 ? void 0 : _b.consume(consumer.queue_name, (msg) => {
                    var _a;
                    if (msg === null) {
                        return null;
                    }
                    console.log("just received a message");
                    let consumed = consumer.handle_message(msg);
                    if (consumed) {
                        (_a = this.channel) === null || _a === void 0 ? void 0 : _a.ack(msg);
                    }
                    return msg;
                }, { noAck: false }));
            }
            console.log("listening for messages");
        });
    }
}
exports.RabbitMQService = RabbitMQService;
