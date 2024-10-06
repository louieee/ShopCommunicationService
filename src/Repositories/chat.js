"use strict";
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
exports.Message = exports.Chat = void 0;
const database_1 = require("../core/database");
const rabbitmq_1 = require("../core/rabbitmq");
const consumer_1 = require("../core/rabbitmq/consumer");
class Chat {
    static create_group(user_id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            let chat = yield database_1.db_client.chat.create({
                data: {
                    is_group: true,
                    participants: {
                        connect: {
                            id: user_id
                        }
                    },
                    group: {
                        create: {
                            name: data.name,
                            creator_id: user_id,
                            type: data.type,
                            description: data.description
                        }
                    }
                },
            });
            if (data.participant_ids && data.participant_ids.length > 0) {
                yield this.update(chat.id, user_id, { participant_ids: data.participant_ids,
                    description: undefined });
            }
            return chat;
        });
    }
    static create_chat(user_id, recipient_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = {
                is_group: false,
                participant_ids: [user_id, recipient_id]
            };
            const new_chat = yield database_1.db_client.chat.create({
                data: data,
            });
            rabbitmq_1.RabbitMQ.connect().then((rs) => __awaiter(this, void 0, void 0, function* () {
                yield rs.consume();
                yield rs.publish([consumer_1.Queues.ReportQueue], {
                    action: "create",
                    data_type: "chat",
                    data: JSON.stringify({
                        "id": new_chat.id,
                        "is_group": data.is_group,
                        "participants": data.participant_ids,
                    })
                });
            }));
            return new_chat;
        });
    }
    static retrieve(id, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return database_1.db_client.chat.findFirst({
                where: {
                    AND: [{ id: id }, { participant_ids: { has: user_id } }]
                }, select: {
                    id: true,
                    is_group: true,
                    participants: {
                        where: {
                            id: {
                                not: user_id
                            }
                        },
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true,
                            user_id: true,
                            profile_pic: true,
                            role: true
                        }
                    },
                    created_at: true,
                    messages: {
                        orderBy: {
                            updated_at: "desc"
                        }, take: 1
                    },
                    group: true,
                }
            });
        });
    }
    static list(user_id_1) {
        return __awaiter(this, arguments, void 0, function* (user_id, page = 1, page_size = 10) {
            let skip = page && page_size ? page_size * (page - 1) : undefined;
            return database_1.db_client.chat.findMany({
                where: {
                    participant_ids: { has: user_id }
                }, select: {
                    id: true,
                    is_group: true,
                    participants: {
                        where: {
                            id: {
                                not: user_id
                            }
                        },
                        select: {
                            id: true,
                            first_name: true,
                            user_id: true,
                            last_name: true,
                            profile_pic: true,
                            role: true
                        }
                    },
                    created_at: true,
                    messages: {
                        orderBy: {
                            updated_at: "desc"
                        }, take: 1
                    },
                    group: true,
                },
                skip: skip ? skip : undefined,
                take: page_size ? page_size : undefined
            });
        });
    }
    static update(id, user_id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            let query;
            if (data.participant_ids) {
                query = {
                    where: {
                        participant_ids: {
                            has: user_id,
                        },
                        id: id
                    },
                    data: { participant_ids: data.participant_ids }
                };
                yield database_1.db_client.chat.update(query);
            }
            if (data.description) {
                query = {
                    where: {
                        participant_ids: {
                            has: user_id,
                        },
                        id: id
                    },
                    data: {
                        group: {
                            update: {
                                description: data.description
                            }
                        }
                    }
                };
                yield database_1.db_client.chat.update(query);
            }
            const chat = yield this.retrieve(id, user_id);
            if (!chat) {
                return query;
            }
            rabbitmq_1.RabbitMQ.connect().then((rs) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d;
                yield rs.consume();
                yield rs.publish([consumer_1.Queues.ReportQueue], {
                    action: "update",
                    data_type: "chat",
                    data: JSON.stringify({
                        "id": chat.id,
                        "is_group": chat.is_group,
                        "participants": chat.participants.map((p) => p === null || p === void 0 ? void 0 : p.id),
                        "group_id": (_a = chat.group) === null || _a === void 0 ? void 0 : _a.id,
                        "group_name": (_b = chat.group) === null || _b === void 0 ? void 0 : _b.name,
                        "group_type": (_c = chat.group) === null || _c === void 0 ? void 0 : _c.type,
                        "group_creator": (_d = chat.group) === null || _d === void 0 ? void 0 : _d.creator_id
                    })
                });
            }));
            return query;
        });
    }
    static delete(id, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const chat = yield this.retrieve(id, user_id);
            let group;
            group = database_1.db_client.group.findFirst({
                where: {
                    chat_id: id,
                    creator_id: user_id
                },
                take: 1
            });
            if (!group) {
                return null;
            }
            const res = yield database_1.db_client.chat.delete({
                where: {
                    id: id
                },
            });
            if (!chat) {
                return res;
            }
            rabbitmq_1.RabbitMQ.connect().then((rs) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d;
                yield rs.consume();
                yield rs.publish([consumer_1.Queues.ReportQueue], {
                    action: "delete",
                    data_type: "chat",
                    data: JSON.stringify({
                        "id": chat.id,
                        "is_group": chat.is_group,
                        "participants": chat.participants.map((p) => p.id),
                        "group_id": (_a = chat.group) === null || _a === void 0 ? void 0 : _a.id,
                        "group_name": (_b = chat.group) === null || _b === void 0 ? void 0 : _b.name,
                        "group_type": (_c = chat.group) === null || _c === void 0 ? void 0 : _c.type,
                        "group_creator": (_d = chat.group) === null || _d === void 0 ? void 0 : _d.creator_id
                    })
                });
            }));
            return res;
        });
    }
    static participants(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const participants = yield database_1.db_client.chat.findFirst({
                where: {
                    id: id
                },
                select: {
                    participants: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true,
                            user_id: true,
                            email: true,
                        }
                    }
                }
            });
            console.log(participants);
            return participants;
        });
    }
}
exports.Chat = Chat;
class Message {
    static list(chat_id_1, user_id_1) {
        return __awaiter(this, arguments, void 0, function* (chat_id, user_id, page = 1, page_size = 10) {
            let skip = page && page_size ? page_size * (page - 1) : undefined;
            return database_1.db_client.message.findMany({
                where: {
                    chat_id: chat_id,
                    chat: {
                        participant_ids: {
                            has: user_id
                        }
                    }
                },
                include: {
                    attachments: {
                        select: {
                            id: true,
                            file_type: true,
                            file: true
                        },
                    }
                },
                skip: skip ? skip : undefined,
                take: page_size ? page_size : undefined
            });
        });
    }
    static create(chat_id, user_id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            let message = yield database_1.db_client.message.create({
                data: {
                    chat_id: chat_id,
                    content: data.content,
                    sender_id: user_id
                },
            });
            if (data.attachments && data.attachments.length > 0) {
                let attachments = (_a = data.attachments) === null || _a === void 0 ? void 0 : _a.map((item) => (Object.assign(Object.assign({}, item), { message_id: message.id })));
                yield database_1.db_client.attachment.createMany({
                    data: attachments
                });
            }
            return message;
        });
    }
    static update(id, user_id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            // @ts-ignore
            yield database_1.db_client.message.update({
                where: {
                    id: id,
                    chat: {
                        participant_ids: {
                            has: user_id
                        }
                    }
                },
                data: Object.assign({}, data)
            });
        });
    }
    static delete(id, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return database_1.db_client.message.delete({
                where: {
                    id: id,
                    sender_id: user_id
                },
            });
        });
    }
    static deleteAttachments(user_id, attachment_ids) {
        return __awaiter(this, void 0, void 0, function* () {
            return database_1.db_client.attachment.deleteMany({
                where: {
                    message: {
                        sender_id: user_id
                    },
                    id: {
                        in: attachment_ids
                    }
                }
            });
        });
    }
}
exports.Message = Message;
