import React, {useState} from "react";

import styles from "./avatar.module.scss";
import {LoginOutlined, RightCircleOutlined, UploadOutlined} from "@ant-design/icons";
import {useNavigate} from "react-router-dom";

import AvatarImg from "@/assets/img/img_3.png";
import {TOKEN_KEY} from "@/constant/Common";

const Index = () => {
  const item = localStorage.getItem(TOKEN_KEY);
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
    localStorage.removeItem(TOKEN_KEY);
    // navigateTo("/login");
    window.location.reload();
  };

  const showUpload= () => {
    setShowLogoutTip(false);
  }

  const login = () => {
    navigateTo("/login")
  }

  const upload = () => {
    console.log('to UploadArticle')
    navigateTo("/upload")
  }
  return (
      <div
          className={styles.avatar}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
      >
        <img
            src={AvatarImg}
            alt="Avatar"
            style={{height: 50, width: 50, borderRadius: "50%", marginTop: 5}}
        />
        {showLogoutTip && item && (
            <div className={styles.userAction}>
              <div className={styles.actionItem} onClick={upload}>
                <div>
                  上传文章
                </div>
                <div>
                  <UploadOutlined/>
                </div>
              </div>
              <div className={styles.actionItem}>
                <div>修改密码</div>
                <div>
                  <RightCircleOutlined/>
                </div>
              </div>
              <div className={styles.actionItem} onClick={logOut}>
                <div>退出登陆</div>
                <div>
                  <LoginOutlined/>
                </div>
              </div>
            </div>
        )}
        {showLogoutTip && !item && (
            <div className={styles.noAuthUserAction}>
              <div className={styles.actionItem} onClick={login}>
                <div>登陆</div>
                <div>
                  <RightCircleOutlined/>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default Index;
