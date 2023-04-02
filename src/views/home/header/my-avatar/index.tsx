import React, {useState} from 'react';
import {UserOutlined} from "@ant-design/icons";
import {Avatar} from "antd";

import styles from './my-avatar.module.scss';

const Index = () => {
  const [showLogoutTip, setShowLogoutTip] = useState(false);
  const handleMouseEnter = () => {
    setShowLogoutTip(true);
  };

  const handleMouseLeave = () => {
    setShowLogoutTip(false);
  };

  return (
    <div className={styles.avatar} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <img src="src/assets/img/img_3.png" alt="Avatar" style={{height: 50, width: 50, borderRadius: '50%', marginTop: 10}}/>
      {showLogoutTip && <div className={styles.logoutTip}>退出</div>}
    </div>
  );
};

export default Index;