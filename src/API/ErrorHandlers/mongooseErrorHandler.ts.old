import express from "express";
import { Error as MongooseError } from "mongoose";

export function mongooseErrorHandler(error: any, req: express.Request, res: express.Response, next: express.NextFunction): void
{
    console.log("mongooseErrorHandler");

    if (error instanceof MongooseError.ValidationError)
    {
        res.status(422).json({
            error: error.message
        });

        /*for (const errorPath in error.errors)
        {
            const validatorError = error.errors[errorPath];
            console.log(validatorError.message);
        }*/
    }
    else if (error instanceof MongooseError.DocumentNotFoundError)
    {
        res.status(404).json({
            error: error.message
        });
    }
    else
    {
        next(error);
    }   
}
