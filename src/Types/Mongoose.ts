import { Document, Types } from "mongoose";

export type MongooseDocument<T> = Document<any, any, T> & T & {
    _id: Types.ObjectId;
};
