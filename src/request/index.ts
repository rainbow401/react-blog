import {TOKEN_KEY} from "@/constant/Common";
import axios from "axios"
import {message} from "antd";

// 创建axios实例
const instance = axios.create({
  // 基本请求路径的抽取
  baseURL: "/api",
  // 这个时间是你每次请求的过期时间，这次请求认为20秒之后这个请求就是失败的
  timeout: 20000,
})

// 请求拦截器
instance.interceptors.request.use((config: any) => {
  console.log('request auth interceptor');
  const item = localStorage.getItem(TOKEN_KEY);
  if (item) {
    config.headers.Authorization = 'Bearer ' + localStorage.getItem(TOKEN_KEY);
  }

  return config
}, err => {
  console.log('request interceptor error');
  return Promise.reject(err);
});

// 响应拦截器
instance.interceptors.response.use(res => {
  console.log('response auth interceptor', res)
  // 检查响应中是否包含无权限的状态码，例如401
  if (res.status === 401 || res.data.code === 401) {
    // 执行无权限跳转逻辑，例如跳转到登录页
    localStorage.removeItem(TOKEN_KEY)
    console.log('response auth interceptor remove token');
    // window.location.href = '/login';
    message.error("非管理员无操作权限，请登录");
  }
  return res.data;
}, async err => {
  console.log('response auth interceptor error')
  await message.error(err.message);
  return Promise.reject(err);
})

export default instance