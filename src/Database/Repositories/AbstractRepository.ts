import { Document, Error, HydratedDocument, Model } from "mongoose";

import { isNull, isNullOrUndefined } from "@Util/TypeUtils";
import { logger } from "@Util";

type DataOrDocument<T> = T | HydratedDocument<T>;

type RequireId<T> = HydratedDocument<T>["_id"];

type SuccessfulValidationResult = {
    isValid: true
};

type FailedValidationResult = {
    isValid: false;
    validationError: Error.ValidationError
};

type FindOneCriteriasType<T> = Partial<T> & { _id?: RequireId<T> };

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
        // TODO arrêter avec insert() et flush(), utiliser insertMany() à la place ?
        // ou alors, passer par un autre objet mais il faut absolument gérer la concurrence
        // entre plusieurs insertions qui peuvent avoir lieu au même moment
        // si utilisation d'un objet qui stocke les documents à insérer en même temps
        // alors, le repository doit vérifier avec une variable lock s'il n'est pas
        // déjà en train de faire une opération
        const document: HydratedDocument<T> = this.createDocument(data);
        const validate: ValidationResult = this.validateDocument(document);

        if (validate.isValid === true)
        {
            this._toInsert.push(document);
        }

        return validate;
    }

    // @TODO blinder avec findOneResult
    public findOne(criterias: FindOneCriteriasType<T>): Promise<HydratedDocument<T> | null>
    {
        return this._model.findOne(criterias).exec();
    }

    public findById(id: RequireId<T>)
    {
        const emptyCriterias: Partial<T> = {};
        const idCriteria: { _id: RequireId<T> } = {
            _id: id
        };
        const criterias: FindOneCriteriasType<T> = {
            ...emptyCriterias,
            ...idCriteria
        };

        // Argument of type '{ _id: RequireId<T>; }' is not assignable to parameter of type 'FindOneCriteriasType<T>'.
        // Type '{ _id: RequireId<T>; }' is not assignable to type 'Partial<T>'.ts(2345)
        // this.findOne({ _id: id });

        return this.findOne(criterias);
    }

    // @TODO bad code
    public async findOneOrInsert(data: T): Promise<HydratedDocument<T> | null>
    {
        const foundDocument: HydratedDocument<T> | null = await this.findOne(data);

        if (!isNull(foundDocument))
        {
            return foundDocument;
        }

        if (this._toInsert.length > 0)
        {
            logger.warning(`findOneOrInsert : _toInsert is not empty`);
        }

        const validationResult: ValidationResult = this.insert(data);

        if (!validationResult.isValid)
        {
            return null;
        }

        const documents: ReadonlyArray<HydratedDocument<T>> = await this._doInsert();

        if (documents.length > 0)
        {
            return documents[0];
        }

        return null;
    }

    public async findLimit(limit: number): Promise<ReadonlyArray<HydratedDocument<T>>>
    {
        const documents: ReadonlyArray<HydratedDocument<T>> = await this._model.find().limit(limit);

        return documents;
    }

    public async flush(): Promise<FlushResult<T>>
    {
        return {
            inserted: await this._doInsert()
        }
    }
}
