import express, { Application} from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import cors from "cors"
import {Settings} from "./core/config";
import Router from "./routes";
import {Server, Socket} from "socket.io";
import http from "http";
import {ChatConsumer} from "./core/websocket/consumers";
import {jwtSocketAuthentication} from "./core/jwt_config";
import * as Sentry from "@sentry/node";
import {RabbitMQ} from "./core/rabbitmq";


Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

const PORT = process.env.PORT || 8000;
const app: Application = express();
const corsOptions = {
  origin: Settings.CORS_ORIGINS,
  headers: Settings.CORS_ALLOW_HEADERS,
  methods: Settings.CORS_ALLOW_METHODS,
  credentials: Settings.CORS_ALLOW_CREDENTIALS
}
app.use(Sentry.Handlers.errorHandler());
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("tiny"));
app.use(express.static("public"));

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: "/swagger.json",
    },
  })
);

app.use(Router);
const server = http.createServer(app);
const server2 = http.createServer(app);
const io = new Server(server, {
  connectionStateRecovery: {}
});
io.use(jwtSocketAuthentication)
ChatConsumer(io).then(r => console.log(""))

RabbitMQ.connect().then(async(rs)=>{
  await rs.consume()
})

server.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
server2.listen(8001, ()=>{
  console.log("Server is also running on port: 8001")
})


