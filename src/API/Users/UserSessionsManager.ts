import { logger } from "@Util";
import { UserSession } from "./UserSession";

class UserSessionWrapper {
    private _lastAccessed: number = Date.now();

    public constructor(private readonly _userSession: UserSession, private readonly _expirationTimeSeconds: number) {}

    /**
     * Get the wrapped UserSession and updates the internal _lastAccessed property to Date.now()
     *
     * @returns {UserSession} The wrapped UserSession
     */
    public getSession(): UserSession {
        this._lastAccessed = Date.now();
        return this._userSession;
    }

    /**
     * @returns {boolean} Whether the session has not been accessed for more than _expirationTimeSeconds
     */
    public isExpired(): boolean {
        return this._lastAccessed + this._expirationTimeSeconds * 1000 < Date.now();
    }

    public destroy(): Promise<void> {
        return this._userSession.saveInDatabase();
    }
}

// @TODO : regularily check expired sessions and clean them
class UserSessionsManager {
    // Key : string representation of the User's ID
    private readonly _sessions: Map<string, UserSessionWrapper> = new Map<string, UserSessionWrapper>();

    public constructor(cleanIntervalSeconds: number) {
        //setInterval(() => this._cleanExpiredSessions(), cleanIntervalSeconds * 1000);
    }

    private _createWrapper(userSession: UserSession): UserSessionWrapper {
        return new UserSessionWrapper(userSession, 1);
    }

    private _cleanExpiredSessions(): void {
        for (const [id, sessionWrapper] of this._sessions) {
            if (sessionWrapper.isExpired()) {
                sessionWrapper.destroy();
                this._sessions.delete(id);
                logger.info(`Cleaned user session ${id}`);
            }
        }
    }

    public hasUserSession(userId: string): boolean {
        return this._sessions.has(userId);
    }

    public getUserSession(userId: string): UserSession | null {
        return this._sessions.get(userId)?.getSession() || null;
    }

    public addUserSession(userSession: UserSession): void {
        const id: string = userSession.getId();

        if (this.hasUserSession(id)) {
            logger.warning(`Trying to overwrite the session of User #${id}`);
            return;
        }

        this._sessions.set(id, this._createWrapper(userSession));
    }
}

// @TODO éviter d'exporter des instances car on peut pas tester la classe
// -> singleton
export const userSessionsManager: UserSessionsManager = new UserSessionsManager(60);
