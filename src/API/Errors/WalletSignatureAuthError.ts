export class WalletSignatureAuthError extends Error {
    public constructor(message: string) {
        super(message);
        this.name = "WalletSignatureAuthError";
    }
}
