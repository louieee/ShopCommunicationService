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
exports.User = void 0;
const database_1 = require("../core/database");
class User {
    constructor(first_name, last_name, email) {
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
        this.id = "";
    }
    static retrieve(id, list) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield database_1.db_client.user.findFirst({
                where: { id: id }
            });
            if (user === null) {
                return null;
            }
            let user_item = { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email,
                profile_pic: user.profile_pic };
            if (list) {
                return user_item;
            }
            else {
                return Object.assign(Object.assign({}, user_item), { role: user.role, created_at: user.created_at, updated_at: user.updated_at });
            }
        });
    }
    static retrieve_by_user_id(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = null;
            user = yield database_1.db_client.user.findFirst({ where: { user_id: user_id },
                select: { id: true, user_id: true, first_name: true, last_name: true, email: true } });
            console.log("user: ", user);
            if (user !== null) {
                return user;
            }
            return user;
        });
    }
    static list(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            let users;
            if (ids !== undefined) {
                users = yield database_1.db_client.user.findMany({
                    where: { id: { in: ids } }
                });
            }
            else {
                users = yield database_1.db_client.user.findMany();
            }
            return users;
        });
    }
    static create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return database_1.db_client.user.create({ data: Object.assign(Object.assign({}, data), { password: "" }) });
        });
    }
    static update(user_id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield database_1.db_client.user.findFirst({ where: { user_id: user_id },
                select: { id: true } });
            if (!user) {
                return false;
            }
            return database_1.db_client.user.update({
                where: { id: user.id },
                data: data,
            });
        });
    }
    static delete(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield database_1.db_client.user.findFirst({ where: { user_id: user_id },
                select: { id: true } });
            if (!user) {
                return false;
            }
            return database_1.db_client.user.delete({
                where: { id: user.id }
            });
        });
    }
}
exports.User = User;
