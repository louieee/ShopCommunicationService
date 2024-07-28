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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserHandler = void 0;
const user_1 = require("../../Repositories/user");
class UserHandler {
}
exports.UserHandler = UserHandler;
_a = UserHandler;
UserHandler.create = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("creating user");
        yield user_1.User.create({ user_id: Number.parseInt(data.id), email: data.email, first_name: data.first_name,
            last_name: data.last_name });
        return true;
    }
    catch (e) {
        console.log(e);
        console.log("an error occurred creating user");
        return false;
    }
});
UserHandler.delete = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield user_1.User.delete(Number.parseInt(data.id));
        return true;
    }
    catch (e) {
        return false;
    }
});
UserHandler.update = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield user_1.User.update(Number.parseInt(data.id), { user_id: Number.parseInt(data.id), email: data.email, first_name: data.first_name,
            last_name: data.last_name });
        return true;
    }
    catch (e) {
        return false;
    }
});
