import axios, { Axios, AxiosRequestConfig } from "axios";

export function createAxios(axiosConfig?: AxiosRequestConfig): Axios
{
    return axios.create({
        // Always resolve
        validateStatus: () => true,
        ...axiosConfig
    });
}
