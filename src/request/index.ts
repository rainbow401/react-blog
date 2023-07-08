import { TOKEN_KEY } from "@/constant/Common";
import axios from "axios"

let token:string | null = '';

function getToken() {
  console.log('getToken', localStorage.getItem(TOKEN_KEY))
  return 'Bearer ' + localStorage.getItem(TOKEN_KEY);
}

// 创建axios实例
const instance = axios.create({
  // 基本请求路径的抽取
  baseURL:"/api",
  // 这个时间是你每次请求的过期时间，这次请求认为20秒之后这个请求就是失败的
  timeout:20000,
})

// 请求拦截器
instance.interceptors.request.use((config: any) =>{
  const token = 'Bearer ' +localStorage.getItem(TOKEN_KEY);
  config.headers.Authorization = token;
  console.log('request interceptor', 'config', config, 'token', token)
  return config
},err=>{
  return Promise.reject(err);
});

// 响应拦截器
instance.interceptors.response.use(res=>{
  console.log('response interceptor',res)
  // 检查响应中是否包含无权限的状态码，例如401
  if (res.status === 401 || res.data.code === 401) {
    // 执行无权限跳转逻辑，例如跳转到登录页
    localStorage.removeItem(TOKEN_KEY)
    console.log('response interceptor remove token');
    window.location.href = '/login';
  }
  return res.data;
},err=>{
  return Promise.reject(err);
})

export default instance