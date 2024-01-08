"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("./client");
const node_cron_1 = __importDefault(require("node-cron"));
// Schedule the "add" task to run every minute
node_cron_1.default.schedule('* * * * *', () => {
    const task = client_1.client.createTask("tasks.add");
    const result = task.applyAsync([1, 2]);
    result.get().then(data => {
        console.log(data);
    });
});
