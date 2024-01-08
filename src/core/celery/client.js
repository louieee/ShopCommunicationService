"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const config_1 = require("../config");
const celery_node_1 = require("celery-node");
exports.client = (0, celery_node_1.createClient)(config_1.Settings.CELERY_BROKER, config_1.Settings.CELERY_BACKEND);
