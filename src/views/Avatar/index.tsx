import React, { useState } from "react";

import styles from "./avatar.module.scss";
import { LoginOutlined, RightCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import AvatarImg from "@/assets/img/img_3.png";

const Index = () => {
  // 控制鼠标hover效果
  const [showLogoutTip, setShowLogoutTip] = useState(false);
  const navigateTo = useNavigate();

  const handleMouseEnter = () => {
    setShowLogoutTip(true);
  };

  const handleMouseLeave = () => {
    setShowLogoutTip(false);
  };

  const logOut = () => {
    localStorage.removeItem("react-admin-token");
    navigateTo("/login");
  };

  return (
    <div
      className={styles.avatar}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <img
        src={AvatarImg}
        alt="Avatar"
        style={{ height: 50, width: 50, borderRadius: "50%", marginTop: 7 }}
      />
      {showLogoutTip && (
        <div className={styles.userInfo}>
          <div className={styles.changePassword}>
            <div>修改密码</div>
            <div>
              <RightCircleOutlined />
            </div>
          </div>
          <div className={styles.loginOut} onClick={logOut}>
            <div>退出登陆</div>
            <div>
              <LoginOutlined />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
