import express from "express";

export type RequestWithQuery<T> = express.Request<any, any, any, T>
export type ResponseWithLocals<T> = express.Response<any, T>
