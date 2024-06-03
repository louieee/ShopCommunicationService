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
const utils_1 = require("../core/websocket/utils");
const jwt_config_1 = require("../core/jwt_config");
let UserView = class UserView extends tsoa_1.Controller {
    /** @summary endpoint to retrieve a user's token */
    getUserToken(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield database_1.db_client.user.findFirst({
                orderBy: {
                    id: "desc"
                }
            });
            // const task = client.createTask("tasks.add");
            // const result = task.applyAsync([1, 2]);
            // result.get().then(data => {
            //   console.log(data);
            //   // client.disconnect().then(r => console.log("Celery client disconnected"));
            // });
            if (!user) {
                return {
                    message: "No User at this moment",
                    data: user,
                    status: 200
                };
            }
            console.log("user: ", user);
            yield (0, utils_1.send_ws)(user, "chats", null, { "message": "good morning" }, "log");
            return {
                message: "user token retrieved",
                data: (0, jwt_config_1.create_access_token)(user, null),
                status: 200
            };
        });
    }
    /** @summary endpoint to retrieve a users */
    getUsers(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            const users = yield database_1.db_client.user.findMany({
                orderBy: {
                    id: "desc"
                },
                where: {
                    id: {
                        not: user.id
                    }
                }
            });
            if (users.length == 0) {
                return {
                    message: "No User at this moment",
                    data: users,
                    status: 200
                };
            }
            yield (0, utils_1.send_ws)(user, "users", null, { "message": "good morning" }, "log");
            return {
                message: "users retrieved",
                data: users,
                status: 200
            };
        });
    }
};
__decorate([
    (0, tsoa_1.Get)('/token'),
    (0, tsoa_1.Security)("api_key"),
    __param(0, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserView.prototype, "getUserToken", null);
__decorate([
    (0, tsoa_1.Get)('/'),
    (0, tsoa_1.Security)("api_key"),
    __param(0, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserView.prototype, "getUsers", null);
UserView = __decorate([
    (0, tsoa_1.Route)("users"),
    (0, tsoa_1.Tags)("users")
], UserView);
exports.default = UserView;
