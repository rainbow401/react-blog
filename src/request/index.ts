import { TOKEN_KEY } from "@/constant/Common";
import axios from "axios"

axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem(TOKEN_KEY);


// 创建axios实例
const instance = axios.create({
  // 基本请求路径的抽取
  baseURL:"http://xue.cnkdl.cn:23683",
  // 这个时间是你每次请求的过期时间，这次请求认为20秒之后这个请求就是失败的
  timeout:20000,
  headers: {
    'Authorization': getToken()
  }
})

function getToken() {
  return 'Bearer ' + localStorage.getItem(TOKEN_KEY);
}

// 请求拦截器
instance.interceptors.request.use(config =>{
  return config
},err=>{
  return Promise.reject(err)
});

// 响应拦截器
instance.interceptors.response.use(res=>{
  // 检查响应中是否包含无权限的状态码，例如401
  if (res.status === 401) {
    // 执行无权限跳转逻辑，例如跳转到登录页
    // window.location.href = '/login';
  }
  return res;
},err=>{
  return Promise.reject(err)
})

export default instance