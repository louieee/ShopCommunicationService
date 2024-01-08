import {Settings} from "./config"
import {NextFunction, Request, Response} from "express";
import {User} from "../schemas/user"
import {Namespace, Server, Socket} from "socket.io";
import {ExtendedError} from "socket.io/dist/namespace";
import {Secret} from "jsonwebtoken";
import {DefaultEventsMap} from "socket.io/dist/typed-events";


const jwt = require('jsonwebtoken');

const ALGORITHM = Settings.JWT_ALGORITHM
const ACCESS_TOKEN_EXPIRE_MINUTES = Settings.JWT_ACCESS_TOKEN_EXPIRY
const REFRESH_TOKEN_EXPIRE_MINUTES = Settings.JWT_REFRESH_TOKEN_EXPIRY
const JWT_SECRET = Settings.JWT_SECRET_KEY

export function create_access_token(user: User, expiresDelta: number|null=null):string{
    expiresDelta = expiresDelta? expiresDelta : ACCESS_TOKEN_EXPIRE_MINUTES;
    const expirationDate = Math.floor(Date.now() / 1000)  + (expiresDelta * 60)
    const payload = {"exp": expirationDate, "user": user}
	const secret: Secret | undefined = Settings.SECRET_KEY;
	console.log("secret: ",secret)
	return jwt.sign(payload, secret, { algorithm: ALGORITHM })
}

function create_refresh_token(user:User, expiresDelta:number|null=null):string{
    expiresDelta = expiresDelta? expiresDelta : REFRESH_TOKEN_EXPIRE_MINUTES;
	const expirationDate = Math.floor(Date.now() / 1000)  + (expiresDelta* 60)
    const payload = {"exp": expirationDate, "user": user}
	return jwt.sign(payload, JWT_SECRET, { algorithm: ALGORITHM })
}



class HttpException extends Error {
  status: number;
  message: string;
  headers: object;

  constructor(status: number, message: string, headers:object) {
    super(message);
    this.status = status;
    this.message = message;
	this.headers = headers;

  }
}
const error = {
		status: 401,
		message: "Could not validate credentials",
		headers: {"WWW-Authenticate": "Bearer"}
	}
function decode_access_token(token:string):User{
	try{
		const payload  = jwt.verify(token, Settings.SECRET_KEY, {algorithm: ALGORITHM})
		const now = Math.floor(Date.now() / 1000)
		if (now >= payload['exp']){
			error.message = "Expired access token"
			throw new HttpException(error.status, error.message, error.headers)
		}
		return payload['user']
	}catch(JsonWebTokenError) {
		throw new HttpException(error.status, error.message, error.headers)
	}
}

function validate_refresh_token(token:string):User{
	try{
		const payload  = jwt.verify(token, JWT_SECRET, {algorithm: ALGORITHM})
		const now = Math.floor(Date.now() / 1000)
		if (now >= payload['exp']){
			error.message = "Expired refresh token"
			throw new HttpException(error.status, error.message, error.headers)
		}
		return payload['user']
	}catch(JsonWebTokenError) {
		throw new HttpException(error.status, error.message, error.headers)
	}
}
interface AuthenticatedRequest extends Request {
    user?: User;
}

function refresh_access_token(refresh_token:string):string{
	const user = validate_refresh_token(refresh_token);
	return create_access_token(user)
}



export async function jwtAuthentication(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
    // Extract the token from the request header
	const authorization = req.headers.authorization
    if (!authorization){
        return res.status(401).json({"error": "No Authorization provided"})
    }
	let token;
	token = authorization.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }
    const user = decode_access_token(token);
    if (user){
      req.user = user
    }
    next();

}

export interface AuthenticatedSocket extends Socket {
    user?: User;
}


export function jwtSocketAuthentication(
  socket: AuthenticatedSocket,
  next: (err?: ExtendedError | undefined) => void
) {
    // Extract the token from the request header
	console.log('Socket User:', socket);
	const token = socket.handshake.auth.token
    if (!token){
        return socket.send({"error": "No Authorization provided"})
    }
	// const user = decode_access_token(token);
    // if (user){
    //   socket.data.user = user;
	//   socket.data.channels = user.getChannels()
    // }
	socket.user = new User("louis", "oha", "o@g.com")
	console.log('Socket User:', socket.user);
    next();

}

export const socketAuthenticationDecorator = (namespace: Namespace<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
  namespace.use((socket: Socket, next) => {
    jwtSocketAuthentication(socket, (err) => {
      if (err) {
        return next(err);
      }
      next();
    });
  });
};

