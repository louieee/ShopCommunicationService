"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.just_comment = exports.add = void 0;
function add(a, b) {
    console.log("Number Addition: ", a, "and", b);
    return a + b;
}
exports.add = add;
function just_comment() {
    console.log("I have commented");
}
exports.just_comment = just_comment;
