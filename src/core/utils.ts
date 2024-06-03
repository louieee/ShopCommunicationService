import express from "express";
import {UserType} from "../schemas/user";


export interface CustomResponse {
    status: number,
    message: string|unknown,
    data: any|undefined
}
export interface CustomRequest extends express.Request{
  user: UserType
}