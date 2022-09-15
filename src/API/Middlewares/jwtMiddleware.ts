import jwt from "express-jwt";

// Authorization: Bearer [token]
export const jwtMiddleware = jwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
    credentialsRequired: true,
    requestProperty: "jwtDecoded"
});
