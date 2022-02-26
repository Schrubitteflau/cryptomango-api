import { ethers } from "ethers";

export function getRandomWallet(): ethers.Wallet
{
    return ethers.Wallet.createRandom();
}

export function getRandomAddress(): string
{
    return getRandomWallet().address;
}

export function getMessageToSign(address: string): string
{
    const obj = {
        message: "Welcome to cryptomango !",
        address
    } as const;
    return JSON.stringify(obj, null, 4);
}

export function signMessageWithWallet(wallet: ethers.Wallet): Promise<string>
{
    const message: string = getMessageToSign(wallet.address);
    return wallet.signMessage(message);
}

export function signMessageWithRandomWallet(): Promise<string>
{
    return signMessageWithWallet(getRandomWallet());
}
