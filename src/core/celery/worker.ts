import {add, just_comment} from "./tasks";
import {Settings} from "../config";
import {createWorker} from 'celery-node';

const worker = createWorker(
  Settings.CELERY_BROKER,
  Settings.CELERY_BACKEND
);

worker.register("tasks.add", add);
worker.register("tasks.just_comment", just_comment);
worker.start().then(r => console.log("Celery worker started"));

// worker.start().then()