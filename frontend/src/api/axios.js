import axios from "axios";

const apiKey = process.env.REACT_APP_API_URL;

export default axios.create({
    baseURL: apiKey,
});