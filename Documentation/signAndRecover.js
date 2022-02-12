const ethers = require("ethers");

function generateMessageToSign(address, nonce)
{
    const obj = {
        message: "Welcome to cryptomango !",
        signerAddress: address,
        nonce
    };
    return JSON.stringify(obj, null, 4);
}

async function getSignatureAndAddressFromClient()
{
    const wallet = ethers.Wallet.createRandom();
    const walletAddress = await wallet.getAddress();
    const nonce = getClientNonce(walletAddress);
    console.log("Client address : " + walletAddress);

    const messageToSign = generateMessageToSign(walletAddress, nonce);
    console.log("Client message to sign : " + messageToSign);
    const signature = await wallet.signMessage(messageToSign);
    console.log("Client signature : " + signature);

    return {
        walletAddress,
        signature
    };
}

// Nonce is different for each client, it can be something like sha3(counter + address)
function getClientNonce(address)
{
    const counter = "1";
    const toHash = `${address}${counter}`;

    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(toHash));
}

async function main()
{
    const { walletAddress, signature } = await getSignatureAndAddressFromClient();
    const clientNonce = getClientNonce(walletAddress);
    const messageSignedByClient = generateMessageToSign(walletAddress, clientNonce);

    // /connect/:walletAddress for example, this is a different parameter than the signature
    console.log("Client says he is : " + walletAddress);
    console.log("Client must have signed : " + messageSignedByClient);

    const signerAddress = ethers.utils.verifyMessage(messageSignedByClient, signature);
    console.log("Signer address is : " + signerAddress);

    const decodedMessage = JSON.parse(messageSignedByClient);
    if (walletAddress === signerAddress)
    {
        console.log("The client owns " + walletAddress + " because he signed the message with his private key");

        if (decodedMessage.signerAddress === walletAddress)
        {
            // This should be true if the condition above is also true, it can also be a frontend bug
            console.log("The client address corresponds to the one in the message");

            if (decodedMessage.nonce === clientNonce)
            {
                console.log(`The nonce (${clientNonce}) is also good, let's update it and generate & send a JWT`);
                // If someone steals the signature of a client, this can't be used to log in again because
                // it signs a message with an outdated nonce
            }
        }
    }
}

main();
