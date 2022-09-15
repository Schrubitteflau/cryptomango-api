import { Document, Error, HydratedDocument, Model } from "mongoose";

import { isNull, isNullOrUndefined } from "@Util/TypeUtils";

type DataOrDocument<T> = T | HydratedDocument<T>;

type RequireId<T> = HydratedDocument<T>["_id"];

type SuccessfulValidationResult = {
    isValid: true;
};

type FailedValidationResult = {
    isValid: false;
    validationError: Error.ValidationError;
};

type FindOneCriteriasType<T> = Partial<T> & { _id?: RequireId<T> };

export type ValidationResult = SuccessfulValidationResult | FailedValidationResult;

class InsertBuffer<T> {
    private readonly _documents: Array<HydratedDocument<T>> = [];

    public constructor(private readonly _repository: AbstractRepository<T>) {}

    public add(data: DataOrDocument<T>): ValidationResult {
        const document: HydratedDocument<T> = this._repository.createDocument(data);
        const validate: ValidationResult = this._repository.validateDocument(document);

        if (validate.isValid === true) {
            this._documents.push(document);
        }

        return validate;
    }

    public insert(): Promise<Array<HydratedDocument<T>>> {
        return this._repository.createMany(this._documents);
    }
}

// T : interface which represents the data scheme
export abstract class AbstractRepository<T> {
    protected constructor(protected _model: Model<T>) {}

    /**
     * @param data The object to check whether it is a document or not
     * @returns Whether data is an instance of Mongoose.Document or not
     * @warning The type HydratedDocument<T> contains T, so that's why this method exist,
     * because we can't rely on the type T to insure that this is not a document
     */
    private _isDocument(data: T): data is HydratedDocument<T> {
        return data instanceof Document;
    }

    public createDocument(data: DataOrDocument<T>): HydratedDocument<T> {
        if (this._isDocument(data)) {
            return data;
        }

        // After a few tests, if data is a document, then it'll make a copy and return
        // an object with the same properties, as a Document
        // I don't know if it's intentional, but it's better to not recreate another
        // Document instance if it's not really needed
        return new this._model(data);
    }

    public validateDocument(document: HydratedDocument<T>): ValidationResult {
        const validationResult: Error.ValidationError | null = document.validateSync();

        // Mongoose returns undefined instead of null
        if (isNullOrUndefined(validationResult)) {
            return {
                isValid: true
            };
        }

        return {
            isValid: false,
            validationError: validationResult
        };
    }

    // @TODO SHOULD ONLY PASS LITTERAL OBJECTS ?
    public createOne(newDocument: T): Promise<HydratedDocument<T>> {
        // @TODO can throw validation error

        // Same as doing : new MyModel(doc).save()
        // Because the new Document instance created by the constructor of MyModel doesn't come from
        // a find query, its property isNew is set to false, so calling save() result in a creation
        return this._model.create(newDocument);
    }

    // @TODO SHOULD ONLY PASS LITTERAL OBJECTS ?
    public createMany(newDocuments: ReadonlyArray<T>): Promise<Array<HydratedDocument<T>>> {
        /*
            [options.ordered «Boolean» = true]
                If true, will fail fast on the first error encountered.
                If false, will insert all the documents it can and report errors later.
            
            The invalid documents will simply be ignored.
            All the documents will be inserted in one single MongoDB query.
        */
        return this._model.insertMany(newDocuments, {
            ordered: false
        });
    }

    // @TODO blinder avec findOneResult
    public findOne(criterias: FindOneCriteriasType<T>): Promise<HydratedDocument<T> | null> {
        return this._model.findOne(criterias).exec();
    }

    public findById(id: RequireId<T>): Promise<HydratedDocument<T> | null> {
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

    public createInsertBuffer(): InsertBuffer<T> {
        return new InsertBuffer(this);
    }
}

export type { InsertBuffer };
