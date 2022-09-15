export class SessionNotExistError extends Error {
    public constructor(userId: string) {
        super(`UserSession for user #${userId} does not exist`);
        this.name = "SessionNotExistError";
    }
}
