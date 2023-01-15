import request from './index'

// 验证码请求
export const CaptchaAPI = ():Promise<CaptchaAPIRes> => request.get('/prod-api/captchaImage')

// 登录请求
export const LoginAPI = (params:LoginAPIReq):Promise<LoginAPIRes> => request.post('/prod-api/login',params)