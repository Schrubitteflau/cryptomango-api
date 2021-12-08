import jwt from "express-jwt";

// Authorization: Bearer [token]
export const jwtMiddleware = jwt({
    secret: "secret",
    algorithms: [ "HS256" ],
    credentialsRequired: true,
    requestProperty: "jwtDecoded"
});
