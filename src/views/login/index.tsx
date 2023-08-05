import React from "react";
import {useNavigate} from "react-router-dom";

import {Button, Form, Input, message} from "antd";

import styles from "./login.module.scss";

import {LoginAPI} from "@/request/api";
import {TOKEN_KEY} from "@/constant/Common";

const Login: React.FC = () => {

  const navigateTo = useNavigate();

  const login = (username: string, password: string) => {
    console.log("登陆", username, password);
    if (!username.trim() || !password.trim()) {
      message.error("请完整输入信息");
      return;
    }

    LoginAPI({
      username: username,
      password: password,
    })
        .then((res: any) => {
          console.log(res);
          if (res.code === 200 && res.success) {
            message.success("登陆成功");
            localStorage.setItem(TOKEN_KEY, res.data);
            navigateTo("/home");
          } else {
            message.error(res.data.message);
          }
        })
        .catch((error: any) => {
          message.error(error.message);
        });
  };

  const onFinish = (values: any) => {
    console.log(values);
    login(values.username, values.password);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  return (
      <div className={styles.loginPage}>
        <div className={styles.form}>
          <Form
              name="basic"
              labelCol={{span: 10}}
              wrapperCol={{span: 6}}
              style={{height: "100%", width:"100%"}}
              initialValues={{remember: true}}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
          >
            <Form.Item
                label="用户名"
                name="username"
                rules={[{required: true, message: "请输入用户名"}]}
            >
              <Input/>
            </Form.Item>

            <Form.Item
                label="密码"
                name="password"
                rules={[{required: true, message: "请输入密码"}]}
            >
              <Input.Password/>
            </Form.Item>
            <Form.Item wrapperCol={{offset: 10, span: 16}}>
              <Button type="primary" htmlType="submit">
                登陆
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
  );
};

export default Login;
