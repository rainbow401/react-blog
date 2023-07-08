// 这个文件专门定义请求参数的，和响应的类型


// 验证码的响应类型约束
interface CaptchaAPIRes {
    msg: string;
    img: string;
    code: number;
    capchaEnabled: boolean;
    uuid: string;
}
// 登录请求参数类型约束
interface LoginAPIReq {
    username: string;
    password: string;
    code?: string;
    uuid?: string;
}
// 登录的响应类型约束
interface LoginAPIRes{
    message: string;
    code: number;
    success: boolean;
    data: string;
}


interface Tag{
    id: number,
    nmae: string,
}