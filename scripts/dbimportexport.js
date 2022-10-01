require("dotenv-flow").config();

const sourceMongoURI = process.env.MONGO_DATABASE_URL;
const exportPath = "./db-export";

function getDbNameOfURI(uri) {
    const splitted = uri.split("/");
    return splitted[splitted.length - 1];
}

const sourceDbName = getDbNameOfURI(sourceMongoURI);
const exportCmd = `mongodump --forceTableScan --uri "${sourceMongoURI}" -o ${exportPath}`;
const importCmd = `mongorestore -d <dbName> --uri <URI> ${exportPath}/${sourceDbName}`;
const importCmdEx = `mongorestore -d ${sourceDbName} --uri "${sourceMongoURI}" ${exportPath}/${sourceDbName}`;

console.log(`mongodump and mongorestore commands for database ${sourceDbName} at "${sourceMongoURI}"`);
console.log(exportCmd);
console.log(importCmd);
console.log("Ex : " + importCmdEx);
