"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tasks_1 = require("./tasks");
const config_1 = require("../config");
const celery_node_1 = require("celery-node");
const worker = (0, celery_node_1.createWorker)(config_1.Settings.CELERY_BROKER, config_1.Settings.CELERY_BACKEND);
worker.register("tasks.add", tasks_1.add);
worker.register("tasks.just_comment", tasks_1.just_comment);
worker.start().then(r => console.log("Celery worker started"));
// worker.start().then()
