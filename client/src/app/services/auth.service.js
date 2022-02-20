import axios from "axios";
import localStorageService from "./localStorage.service";
import config from "../config.json";

const env = require("dotenv").config().parsed;

const httpAuth = axios.create({
    baseURL: config.apiEndpoint + "auth/",
    params: {
        key: process.env.REACT_APP_FIREBASE_KEY,
        PORT: env.PORT
    }
});

const authService = {
    register: async (payload) => {
        const { data } = await httpAuth.post(`signUp`, payload);
        return data;
    },
    login: async ({ email, password }) => {
        const { data } = await httpAuth.post(`signInWithPassword`, {
            email,
            password,
            returnSecureToken: true
        });
        // console.log("auth login res data", data);

        return data;
    },
    refresh: async () => {
        const { data } = await httpAuth.post("token", {
            grant_type: "refresh_token",
            refresh_token: localStorageService.getRefreshToken()
        });
        return data;
    }
};
export default authService;
