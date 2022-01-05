import { TokenSwipe, ITokenSwipe, User, IUser } from "@Models";
import { UserSession } from "./UserSession";
import { MongooseDocument } from "@Types/Mongoose";

/**
 * This class allows us to asynchronously create an User instance, which all the
 * needed data is fetched from the database and provided to the object
 * #### Warning : this does not creates a new User in the database !
 */
export class UserSessionFactory
{
    /**
     * @param _userId _id of the User in the database
     */
    public constructor(private readonly _userId: string) { }

    /**
     * Builds an UserSession object once all the needed data is fetched from the database
     * @returns {Promise<UserSession>} a Promise resolved with an UserSession instance
     * @rejects if an error occurs while communicating with the database
     * @rejects if the user cannot be found
     */
    public async buildUserSession(): Promise<UserSession>
    {
        const userDocument: MongooseDocument<IUser> = await this._fetchUser();
        const tokenSwipeDocument: MongooseDocument<ITokenSwipe> = await this._fetchOrCreateTokenSwipe();

        return new UserSession(userDocument, tokenSwipeDocument);
    }

    /**
     * Fetch User's data from the database
     * @returns {Promise<MongooseDocument<IUser>>} a Promise resolved with a document representing an User
     * @rejects if an error occurs while communicating with the database
     * @rejects if the user cannot be found
     */
    private async _fetchUser(): Promise<MongooseDocument<IUser>>
    {
        return await User.findOne({
            _id: this._userId
        }).orFail();
    }

    /**
     * Fetch TokenSwipe's data from the database, or create a new one if it doesn't exists yet
     * @returns {Promise<MongooseDocument<ITokenSwipe>>} a Promise resolved with a document representing a TokenSwipe
     * @rejects if an error occurs while communicating with the database
     */
    private async _fetchOrCreateTokenSwipe(): Promise<MongooseDocument<ITokenSwipe>>
    {
        const tokenSwipe = await TokenSwipe.findOne({
            user: this._userId
        });

        if (tokenSwipe === null)
        {
            return this._createTokenSwipe();
        }

        return tokenSwipe;
    }

    /**
     * Creates a new TokenSwipe in the database
     * @returns {Promise<MongooseDocument<ITokenSwipe>>} a Promise resolved with a document representing the newly created TokenSwipe
     * @rejects if an error occurs while communicating with the database
     */
    private async _createTokenSwipe(): Promise<MongooseDocument<ITokenSwipe>>
    {
        return await TokenSwipe.create({
            erc20: {
                creationTimestamp: 0,
                creationTransactionIndex: 0
            },
            erc721: {
                creationTimestamp: 0,
                creationTransactionIndex: 0
            },
            erc1155: {
                creationTimestamp: 0,
                creationTransactionIndex: 0
            },
            user: this._userId
        });
    }
}