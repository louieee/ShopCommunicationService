import {Settings} from "./config"
import {NextFunction, Request, Response} from "express";
import {User} from "../Repositories/user"
import {Namespace, Server, Socket} from "socket.io";
import {ExtendedError} from "socket.io/dist/namespace";
import {Secret} from "jsonwebtoken";
import {DefaultEventsMap} from "socket.io/dist/typed-events";
import {BaseUserType, TokenUserPayload, UserListType, UserType} from "../schemas/user";


const jwt = require('jsonwebtoken');

const ALGORITHM = Settings.JWT_ALGORITHM
const ACCESS_TOKEN_EXPIRE_MINUTES = Settings.JWT_ACCESS_TOKEN_EXPIRY
const REFRESH_TOKEN_EXPIRE_MINUTES = Settings.JWT_REFRESH_TOKEN_EXPIRY
const JWT_SECRET = Settings.JWT_SECRET_KEY
const JWT_ISSUER = Settings.JWT_ISSUER

export function create_access_token(user: UserType, expiresDelta: number|null=null):string{
    expiresDelta = expiresDelta? expiresDelta : ACCESS_TOKEN_EXPIRE_MINUTES;
    const expirationDate = Math.floor(Date.now() / 1000)  + (expiresDelta * 60)
    const payload = {"exp": expirationDate, "user": user}
	const secret: Secret | undefined = Settings.SECRET_KEY;
	console.log("secret: ",secret)
	return jwt.sign(payload, secret, { algorithm: ALGORITHM })
}

function create_refresh_token(user:UserType, expiresDelta:number|null=null):string{
    expiresDelta = expiresDelta? expiresDelta : REFRESH_TOKEN_EXPIRE_MINUTES;
	const expirationDate = Math.floor(Date.now() / 1000)  + (expiresDelta* 60)
    const payload = {"exp": expirationDate, "user": user}
	return jwt.sign(payload, JWT_SECRET, { algorithm: ALGORITHM })
}



class HttpException extends Error {
  status: number;
  message: string;
  headers: object|undefined;

  constructor(status: number, message: string, headers:object|undefined) {
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
async function decode_access_token(token:string):Promise<UserType>{
	console.log("token: ", token)
	console.log("secret: ", JWT_SECRET)
	console.log("alg: ", ALGORITHM)
	console.log("issuer: ", JWT_ISSUER)

	try{
		const payload  = jwt.verify(token, JWT_SECRET,
			{algorithm: ALGORITHM, issuer: JWT_ISSUER})
		console.log("payload: ", payload["user"])
		const now = Math.floor(Date.now() / 1000)
		if (now >= payload['exp']){
			error.message = "Expired access token"
			throw new HttpException(error.status, error.message, error.headers)
		}
		const user = await User.retrieve_by_user_id(Number.parseInt(payload["user"]["user_id"]))
		if (user === null){
			error.message = "This user does not exist"
			error.status = 404
			throw new HttpException(error.status, error.message, error.headers)
		}
		return user
	}catch(JsonWebTokenError) {
		console.log("jwt error2: ", error.message)
		throw new HttpException(error.status, error.message, error.headers)
	}
}

function validate_refresh_token(token:string):UserType{
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
return res.status(401).json({"error": "No Token was supplied"})
    }
	try {
		const user = await decode_access_token(token);
		if (user) {
			req.user = user
		}
		next();
	}catch (err){
		console.log("jwt error: ", err)
		return res.status(401).json({error: "Invalid Token"})
	}

}

export interface AuthenticatedSocket extends Socket {
    user?: User;
}


export async function jwtSocketAuthentication(
  socket: AuthenticatedSocket,
  next: (err?: ExtendedError | undefined) => void
) {
    // Extract the token from the request header
	const token = socket.handshake.auth.token
    if (!token){
        return socket.send({"error": "No Authorization provided"})
    }
	const user = await decode_access_token(token);
    if (user){
      socket.user = user;
	  // socket.data.channels = user.getChannels()
    }
	next();

}

export const socketAuthenticationDecorator = async(namespace: Namespace<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
  namespace.use(async (socket: Socket, next) => {
    await jwtSocketAuthentication(socket, (err) => {
      if (err) {
        return next(err);
      }
      next();
    });
  });
};

