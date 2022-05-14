import { Request, Response } from "express";

export type RequestWithQuery<T> = Request<any, any, any, T>
export type ResponseWithLocals<T> = Response<any, T>
