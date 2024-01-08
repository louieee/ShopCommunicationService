import {client} from "./client";
import cron from "node-cron"


// Schedule the "add" task to run every minute
cron.schedule('* * * * *', () => {
    const task = client.createTask("tasks.add");
    const result = task.applyAsync([1, 2]);
    result.get().then(data => {
    console.log(data);
});
});
