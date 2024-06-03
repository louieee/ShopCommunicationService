"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationConsumer = exports.Consumer = exports.Exchange = exports.Queues = void 0;
var Queues;
(function (Queues) {
    Queues["AccountQueue"] = "account_queue";
    Queues["InventoryQueue"] = "inventory_queue";
    Queues["ReportQueue"] = "report_queue";
    Queues["ChatQueue"] = "chat_queue";
    Queues["CRMQueue"] = "crm_queue";
    Queues["DefaultQueue"] = "default_queue";
})(Queues || (exports.Queues = Queues = {}));
exports.Exchange = { name: "sales_app", type: "fanout" };
class Consumer {
    constructor() {
        this.queue_name = Queues.DefaultQueue;
    }
    handle_message(message) {
        if (message == null) {
            return;
        }
        console.log(" [x] Received '%s'", message.content.toString());
        return message;
    }
}
exports.Consumer = Consumer;
class CommunicationConsumer extends Consumer {
    constructor() {
        super(...arguments);
        this.queue_name = Queues.ChatQueue;
    }
    handle_message(message) {
        if (message == null) {
            return;
        }
        console.log(" [x] Received '%s'", JSON.parse(message.content.toString()));
        return message;
    }
}
exports.CommunicationConsumer = CommunicationConsumer;
