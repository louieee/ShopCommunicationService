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
exports.socketAuthenticationDecorator = exports.jwtSocketAuthentication = exports.jwtAuthentication = exports.create_access_token = void 0;
const config_1 = require("./config");
const user_1 = require("../schemas/user");
const jwt = require('jsonwebtoken');
const ALGORITHM = config_1.Settings.JWT_ALGORITHM;
const ACCESS_TOKEN_EXPIRE_MINUTES = config_1.Settings.JWT_ACCESS_TOKEN_EXPIRY;
const REFRESH_TOKEN_EXPIRE_MINUTES = config_1.Settings.JWT_REFRESH_TOKEN_EXPIRY;
const JWT_SECRET = config_1.Settings.JWT_SECRET_KEY;
function create_access_token(user, expiresDelta = null) {
    expiresDelta = expiresDelta ? expiresDelta : ACCESS_TOKEN_EXPIRE_MINUTES;
    const expirationDate = Math.floor(Date.now() / 1000) + (expiresDelta * 60);
    const payload = { "exp": expirationDate, "user": user };
    const secret = config_1.Settings.SECRET_KEY;
    console.log("secret: ", secret);
    return jwt.sign(payload, secret, { algorithm: ALGORITHM });
}
exports.create_access_token = create_access_token;
function create_refresh_token(user, expiresDelta = null) {
    expiresDelta = expiresDelta ? expiresDelta : REFRESH_TOKEN_EXPIRE_MINUTES;
    const expirationDate = Math.floor(Date.now() / 1000) + (expiresDelta * 60);
    const payload = { "exp": expirationDate, "user": user };
    return jwt.sign(payload, JWT_SECRET, { algorithm: ALGORITHM });
}
class HttpException extends Error {
    constructor(status, message, headers) {
        super(message);
        this.status = status;
        this.message = message;
        this.headers = headers;
    }
}
const error = {
    status: 401,
    message: "Could not validate credentials",
    headers: { "WWW-Authenticate": "Bearer" }
};
function decode_access_token(token) {
    try {
        const payload = jwt.verify(token, config_1.Settings.SECRET_KEY, { algorithm: ALGORITHM });
        const now = Math.floor(Date.now() / 1000);
        if (now >= payload['exp']) {
            error.message = "Expired access token";
            throw new HttpException(error.status, error.message, error.headers);
        }
        return payload['user'];
    }
    catch (JsonWebTokenError) {
        throw new HttpException(error.status, error.message, error.headers);
    }
}
function validate_refresh_token(token) {
    try {
        const payload = jwt.verify(token, JWT_SECRET, { algorithm: ALGORITHM });
        const now = Math.floor(Date.now() / 1000);
        if (now >= payload['exp']) {
            error.message = "Expired refresh token";
            throw new HttpException(error.status, error.message, error.headers);
        }
        return payload['user'];
    }
    catch (JsonWebTokenError) {
        throw new HttpException(error.status, error.message, error.headers);
    }
}
function refresh_access_token(refresh_token) {
    const user = validate_refresh_token(refresh_token);
    return create_access_token(user);
}
function jwtAuthentication(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // Extract the token from the request header
        const authorization = req.headers.authorization;
        if (!authorization) {
            return res.status(401).json({ "error": "No Authorization provided" });
        }
        let token;
        token = authorization.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized - No token provided' });
        }
        const user = decode_access_token(token);
        if (user) {
            req.user = user;
        }
        next();
    });
}
exports.jwtAuthentication = jwtAuthentication;
function jwtSocketAuthentication(socket, next) {
    // Extract the token from the request header
    console.log('Socket User:', socket);
    const token = socket.handshake.auth.token;
    if (!token) {
        return socket.send({ "error": "No Authorization provided" });
    }
    // const user = decode_access_token(token);
    // if (user){
    //   socket.data.user = user;
    //   socket.data.channels = user.getChannels()
    // }
    socket.user = new user_1.User("louis", "oha", "o@g.com");
    console.log('Socket User:', socket.user);
    next();
}
exports.jwtSocketAuthentication = jwtSocketAuthentication;
const socketAuthenticationDecorator = (namespace) => {
    namespace.use((socket, next) => {
        jwtSocketAuthentication(socket, (err) => {
            if (err) {
                return next(err);
            }
            next();
        });
    });
};
exports.socketAuthenticationDecorator = socketAuthenticationDecorator;
