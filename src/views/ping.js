"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tsoa_1 = require("tsoa");
const express_1 = __importDefault(require("express"));
const database_1 = require("../core/database");
const client_1 = require("../core/celery/client");
const utils_1 = require("../core/websocket/utils");
let PingView = class PingView extends tsoa_1.Controller {
    /** @summary endpoint to ping the request */
    getMessage(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const allUsers = yield database_1.db_client.user.findMany();
            const task = client_1.client.createTask("tasks.add");
            const result = task.applyAsync([1, 2]);
            result.get().then(data => {
                console.log(data);
                // client.disconnect().then(r => console.log("Celery client disconnected"));
            });
            const user = allUsers[0];
            console.log("user: ", user);
            (0, utils_1.send_ws)(user, "chats", { "message": "good morning" });
            return {
                message: "users retrieved",
                data: allUsers
            };
        });
    }
};
__decorate([
    (0, tsoa_1.Get)('/'),
    (0, tsoa_1.Security)('api_key'),
    __param(0, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PingView.prototype, "getMessage", null);
PingView = __decorate([
    (0, tsoa_1.Route)("ping")
], PingView);
exports.default = PingView;
