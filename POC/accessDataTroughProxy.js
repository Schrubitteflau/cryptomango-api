const ethers = require("ethers");

const proxyAbi = [{"inputs":[{"internalType":"address","name":"initialLogic","type":"address"},{"internalType":"address","name":"initialAdmin","type":"address"},{"internalType":"bytes","name":"_data","type":"bytes"}],"stateMutability":"payable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"previousAdmin","type":"address"},{"indexed":false,"internalType":"address","name":"newAdmin","type":"address"}],"name":"AdminChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"implementation","type":"address"}],"name":"Upgraded","type":"event"},{"stateMutability":"payable","type":"fallback"},{"inputs":[],"name":"admin","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newAdmin","type":"address"}],"name":"changeAdmin","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"implementation","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newImplementation","type":"address"}],"name":"upgradeTo","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newImplementation","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"upgradeToAndCall","outputs":[],"stateMutability":"payable","type":"function"},{"stateMutability":"payable","type":"receive"}];

const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed.binance.org/");

// proxy qui transfère les appels vers 0xdb4995a2d234fad86794e6265cd0707e2d61a08c
const contract = new ethers.Contract("0x7b5f99fbc5c1e5b9e75d41b8e56ecb7caf39e4c4", proxyAbi, provider)

async function main()
{
    // Admin only
    //const imp = await contract.implementation();

    const storagePosition = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
    const result = await provider.getStorageAt(contract.address, storagePosition);
    // 0xdb4995a2d234fad86794e6265cd0707e2d61a08c
    console.log(result);

}
main()