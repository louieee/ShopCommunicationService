import {Settings} from "../config";
import {createClient} from "celery-node";

export const client = createClient(
    Settings.CELERY_BROKER,
    Settings.CELERY_BACKEND
);

