import Axios, { type AxiosError, type AxiosRequestConfig } from "axios";

export const apiClient = Axios.create({
  baseURL: "/api",
});

export const setApiClientBaseUrl = (baseURL: string) => {
  apiClient.defaults.baseURL = baseURL;
};

export const customClient = <T>(config: AxiosRequestConfig): Promise<T> => {
  return apiClient(config).then(({ data }) => data);
};

export interface ErrorType<Error> extends AxiosError<Error> {}
