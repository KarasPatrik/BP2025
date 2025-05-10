import axios from 'axios';
import API_BASE_URL from "../config.js";

const http = axios.create({
    baseURL: '/', // nginx → Laravel
    withCredentials: true,           // send cookies every time
});

// fetch CSRF cookie once and cache the promise
let csrfPromise;
export async function ensureCsrf () {
    if (!csrfPromise) {
        csrfPromise = http.get('/sanctum/csrf-cookie');
    }
    return csrfPromise;
}

// helper for POST/PUT/PATCH/DELETE that need CSRF
export async function securePost (url, data = {}) {
    await ensureCsrf();
    return http.post(url, data);
}

// export raw instance for GETs (no CSRF needed)
export default http;