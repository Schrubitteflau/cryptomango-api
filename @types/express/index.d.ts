import { IJwtBody } from "@API/Routers/authRouter";

declare global
{
    namespace Express
    {
        interface Request
        {
            jwtDecoded?: IJwtBody;
        }
    }
}
