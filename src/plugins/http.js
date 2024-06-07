import axios from 'axios';
import { $Storage } from '@/plugins/storage.js';
let $Http = axios.create({
    method: 'POST',
    baseURL: import.meta.env.VITE_HOST_PATH,
    timeout: 1000 * 60,
    withCredentials: false,
    responseType: 'json',
    responseEncoding: 'utf8',
    headers: {}
});
// 添加请求拦截器
$Http.interceptors.request.use(
    function (config) {
        let token = $Storage.local.get('token');
        if (token) {
            config.headers.authorization = 'Bearer ' + token;
        }
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

// 添加响应拦截器
$Http.interceptors.response.use(
    function (res) {
        if (res.data.code === 0) {
            return Promise.resolve(res.data);
        }
        Message.error(res.data.msg);
        return Promise.reject(res.data);
    },
    function (err) {
        return Promise.reject(err);
    }
);
export { $Http };
