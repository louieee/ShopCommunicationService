"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("./core/config");
const routes_1 = __importDefault(require("./routes"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const consumers_1 = require("./core/websocket/consumers");
const jwt_config_1 = require("./core/jwt_config");
const Sentry = __importStar(require("@sentry/node"));
const rabbitmq_1 = require("./core/rabbitmq");
Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
});
const PORT = process.env.PORT || 8000;
const app = (0, express_1.default)();
const corsOptions = {
    origin: config_1.Settings.CORS_ORIGINS,
    headers: config_1.Settings.CORS_ALLOW_HEADERS,
    methods: config_1.Settings.CORS_ALLOW_METHODS,
    credentials: config_1.Settings.CORS_ALLOW_CREDENTIALS
};
app.use(Sentry.Handlers.errorHandler());
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use((0, morgan_1.default)("tiny"));
app.use(express_1.default.static("public"));
app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(undefined, {
    swaggerOptions: {
        url: "/swagger.json",
    },
}));
app.use(routes_1.default);
const server = http_1.default.createServer(app);
const server2 = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    connectionStateRecovery: {}
});
io.use(jwt_config_1.jwtSocketAuthentication);
(0, consumers_1.ChatConsumer)(io).then(r => console.log(""));
rabbitmq_1.RabbitMQ.connect().then((rs) => __awaiter(void 0, void 0, void 0, function* () {
    yield rs.consume();
}));
server.listen(PORT, () => {
    console.log("Server is running on port", PORT);
});
server2.listen(8001, () => {
    console.log("Server is also running on port: 8001");
});
