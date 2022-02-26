import { sign as jwtSign } from "jsonwebtoken";

export function getValidAccessToken(): string
{
    return jwtSign({}, process.env.JWT_SECRET, {
        algorithm: "HS256",
        expiresIn: "1h"
    });
}

export { decode as jwtDecode } from "jsonwebtoken";
