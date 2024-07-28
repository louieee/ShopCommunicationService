"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationConsumer = exports.Consumer = exports.Exchange = exports.Queues = void 0;
const handlers_1 = require("./handlers");
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
            return true;
        }
        console.log(" [x] Received '%s'", message.content.toString());
        return true;
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
            return true;
        }
        let payload;
        payload = JSON.parse(message.content.toString());
        switch (payload.type) {
            case "user":
                this.handle_user_actions(payload.action, payload.data);
                break;
            default: break;
        }
        return true;
    }
    handle_user_actions(action, data) {
        switch (action) {
            case "create":
                handlers_1.UserHandler.create(JSON.parse(data)).then((result) => {
                    return result;
                });
                break;
            case "delete":
                handlers_1.UserHandler.delete(JSON.parse(data)).then((result) => {
                    return result;
                });
                break;
            case "update":
                handlers_1.UserHandler.update(JSON.parse(data)).then((result) => {
                    return result;
                });
        }
        return true;
    }
}
exports.CommunicationConsumer = CommunicationConsumer;
