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
Object.defineProperty(exports, "__esModule", { value: true });
const tsoa_1 = require("tsoa");
const utils_1 = require("../core/websocket/utils");
const chat_1 = require("../Repositories/chat");
let ChatView = class ChatView extends tsoa_1.Controller {
    /** @summary endpoint to create a chat */
    createChat(data, req) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = req.user;
            try {
                const result = yield chat_1.Chat.create_chat(user.id, data.recipient_id);
                yield (0, utils_1.send_ws)(user, "chats", result === null || result === void 0 ? void 0 : result.id, { "event": "New Chat", data: result });
                return { message: "Chat created successfully",
                    data: result, status: 201 };
            }
            catch (err) {
                return { message: err, status: 400, data: null };
            }
        });
    }
    /** @summary endpoint to create a group */
    createGroup(data, req) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = req.user;
            try {
                const result = yield chat_1.Chat.create_group(user.id, data);
                yield (0, utils_1.send_ws)(user, "chats", result.id, { "event": "New Group", data: result });
                return { message: "Group created successfully",
                    data: result, status: 201 };
            }
            catch (err) {
                console.log(err);
                return { message: err, status: 400, data: null };
            }
        });
    }
    /** @summary endpoint to update a group */
    updateChat(id, data, req) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = req.user;
            try {
                const result = yield chat_1.Chat.update(id, user.id, data);
                yield (0, utils_1.send_ws)(user, "chats", id, { "event": "Updated Group", data: result });
                return { message: "Group updated successfully",
                    data: result, status: 200 };
            }
            catch (err) {
                console.log(err);
                return { message: err, status: 400, data: null };
            }
        });
    }
    /** @summary endpoint to update a group */
    deleteChat(id, req) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = req.user;
            try {
                const result = yield chat_1.Chat.delete(id, user.id);
                yield (0, utils_1.send_ws)(user, "chats", null, { "event": "Delete Group", data: result });
                return { message: "Group deleted successfully",
                    data: result, status: 204 };
            }
            catch (err) {
                console.log(err);
                return { message: err, status: 400, data: null };
            }
        });
    }
    /** @summary endpoint to retrieve list of chats
     *
     * */
    listChat(req_1) {
        return __awaiter(this, arguments, void 0, function* (req, page = 1, page_size = 10) {
            try {
                const user = req.user;
                const result = yield chat_1.Chat.list(user.id, page, page_size);
                return {
                    message: "Chats retrieved successfully",
                    data: result,
                    status: 200
                };
            }
            catch (err) {
                console.error(err);
                return {
                    message: err || "Error retrieving chats",
                    status: 400,
                    data: null
                };
            }
        });
    }
    /** @summary endpoint to retrieve a chat */
    retrieveChat(id, req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const result = yield chat_1.Chat.retrieve(id, user.id);
                return {
                    message: "Chat retrieved successfully",
                    data: result,
                    status: 200
                };
            }
            catch (err) {
                console.error(err);
                return {
                    message: err || "Error retrieving chats",
                    status: 400,
                    data: null
                };
            }
        });
    }
    /** @summary endpoint to send message to a chat */
    createMessage(id, data, req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const result = yield chat_1.Message.create(id, user.id, data);
                const user_data = yield chat_1.Chat.participants(id);
                if (user_data && user_data.participants.length > 0)
                    for (let p in user_data.participants) {
                        let obj_user = user_data.participants[parseInt(p)];
                        yield (0, utils_1.send_ws)(obj_user, "users", null, { "event": "New Message", "payload": result });
                    }
                yield (0, utils_1.send_ws)(user, "chats", id, { "event": "New Message", "payload": result });
                return {
                    message: "Chat message sent successfully",
                    data: result,
                    status: 201
                };
            }
            catch (err) {
                console.error(err);
                return {
                    message: err || "Error sending message",
                    status: 400,
                    data: null
                };
            }
        });
    }
    /** @summary endpoint to retrieve all messages in a chat */
    listMessage(id_1, req_1) {
        return __awaiter(this, arguments, void 0, function* (id, req, page = 1, page_size = 10) {
            try {
                const user = req.user;
                const result = yield chat_1.Message.list(id, user.id, page, page_size);
                return {
                    message: "Chat message list retrieved successfully",
                    data: result,
                    status: 201
                };
            }
            catch (err) {
                console.error(err);
                return {
                    message: err || "Error retrieving chat messages",
                    status: 400,
                    data: null
                };
            }
        });
    }
    /** @summary endpoint to delete a message in a chat */
    deleteMessage(id, req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const result = yield chat_1.Message.delete(id, user.id);
                return {
                    message: "Chat message deleted successfully",
                    data: result,
                    status: 204
                };
            }
            catch (err) {
                console.error(err);
                return {
                    message: err || "Error deleting message",
                    status: 400,
                    data: null
                };
            }
        });
    }
    /** @summary endpoint to update a message in a chat */
    updateMessage(id, data, req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const result = yield chat_1.Message.update(id, user.id, data);
                return {
                    message: "Chat message updated successfully",
                    data: result,
                    status: 200
                };
            }
            catch (err) {
                console.error(err);
                return {
                    message: err || "Error updating message",
                    status: 400,
                    data: null
                };
            }
        });
    }
    /** @summary endpoint to delete message attachments in a chat */
    deleteMessageAttachments(attachment_ids, req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const result = yield chat_1.Message.deleteAttachments(user.id, attachment_ids);
                return {
                    message: "Chat message attachments deleted successfully",
                    data: result,
                    status: 200
                };
            }
            catch (err) {
                console.error(err);
                return {
                    message: err || "Error deleting message attachments",
                    status: 400,
                    data: null
                };
            }
        });
    }
};
__decorate([
    (0, tsoa_1.Post)('/'),
    __param(0, (0, tsoa_1.Body)()),
    __param(1, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatView.prototype, "createChat", null);
__decorate([
    (0, tsoa_1.Post)('/groups'),
    __param(0, (0, tsoa_1.Body)()),
    __param(1, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatView.prototype, "createGroup", null);
__decorate([
    (0, tsoa_1.Put)('/:id'),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Body)()),
    __param(2, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ChatView.prototype, "updateChat", null);
__decorate([
    (0, tsoa_1.Delete)('/:id'),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChatView.prototype, "deleteChat", null);
__decorate([
    (0, tsoa_1.Get)('/'),
    __param(0, (0, tsoa_1.Request)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ChatView.prototype, "listChat", null);
__decorate([
    (0, tsoa_1.Get)('/:id'),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChatView.prototype, "retrieveChat", null);
__decorate([
    (0, tsoa_1.Post)('/:id/messages'),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Body)()),
    __param(2, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ChatView.prototype, "createMessage", null);
__decorate([
    (0, tsoa_1.Get)('/:id/messages'),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Request)()),
    __param(2, (0, tsoa_1.Query)()),
    __param(3, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ChatView.prototype, "listMessage", null);
__decorate([
    (0, tsoa_1.Delete)('/messages/:id'),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChatView.prototype, "deleteMessage", null);
__decorate([
    (0, tsoa_1.Put)('/messages/:id'),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Body)()),
    __param(2, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ChatView.prototype, "updateMessage", null);
__decorate([
    (0, tsoa_1.Delete)('/messages/attachments'),
    __param(0, (0, tsoa_1.Body)()),
    __param(1, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], ChatView.prototype, "deleteMessageAttachments", null);
ChatView = __decorate([
    (0, tsoa_1.Route)("chats"),
    (0, tsoa_1.Tags)("chats"),
    (0, tsoa_1.Security)("api_key")
], ChatView);
exports.default = ChatView;
