import { Document, Error, HydratedDocument, Model } from "mongoose";

import { isNullOrUndefined } from "@Util";

type DataOrDocument<T> = T | HydratedDocument<T>;

type SuccessfulValidationResult = {
    isValid: true
};

type FailedValidationResult = {
    isValid: false;
    validationError: Error.ValidationError
};

export type ValidationResult = SuccessfulValidationResult | FailedValidationResult;

export type FlushResult<T> = {
    inserted: ReadonlyArray<HydratedDocument<T>>
};

// T : interface which represents the data scheme
export abstract class AbstractRepository<T>
{
    // Raw validated data that needs to be saved in the collection
    private _toInsert: Array<HydratedDocument<T>> = [];

    protected constructor
    (
        protected _model: Model<T>
    ) { }

    /**
     * @param data The object to check whether it is a document or not
     * @returns Whether data is an instance of Mongoose.Document or not
     * @warning The type HydratedDocument<T> contains T, so that's why this method exist,
     * because we can't rely on the type T to insure that this is not a document
     */
    private _isDocument(data: T): data is HydratedDocument<T>
    {
        return (data instanceof Document);
    }

    private async _doInsert(): Promise<ReadonlyArray<HydratedDocument<T>>>
    {
        if (this._toInsert.length === 0) return [];

        /*
            [options.ordered «Boolean» = true]
                If true, will fail fast on the first error encountered.
                If false, will insert all the documents it can and report errors later.
        */

        // @TODO blinder

        const insertedDocuments: ReadonlyArray<HydratedDocument<T>> = await this._model.insertMany(this._toInsert, {
            ordered: false
        });

        this._toInsert = [];

        return insertedDocuments;
    }

    public createDocument(data: DataOrDocument<T>): HydratedDocument<T>
    {
        if (this._isDocument(data)) return data;

        return new this._model(data);
    }

    public validateDocument(document: HydratedDocument<T>): ValidationResult
    {
        const validationResult: Error.ValidationError | null = document.validateSync();

        // Mongoose returns undefined instead of null
        if (isNullOrUndefined(validationResult))
        {
            return {
                isValid: true
            };
        }

        return {
            isValid: false,
            validationError: validationResult
        };
    }

    /**
     * @param data The data to insert in the database
     * @returns Whether or not the data is valid and will effectively be stored
     * @warning Raw data should be passed to this method, not a document
     */
    public insert(data: DataOrDocument<T>): ValidationResult
    {
        const document: HydratedDocument<T> = this.createDocument(data);
        const validate: ValidationResult = this.validateDocument(document);

        if (validate.isValid === true)
        {
            this._toInsert.push(document);
        }

        return validate;
    }

    // @TODO blinder avec findOneResult
    public findOne(criterias: Partial<T>): Promise<HydratedDocument<T> | null>
    {
        return this._model.findOne(criterias).exec();
    }

    public async flush(): Promise<FlushResult<T>>
    {
        return {
            inserted: await this._doInsert()
        }
    }
}
