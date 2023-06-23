import { theme } from "antd";

import styles from "./home.module.scss";

import Info from "@/views/Home/Info";
import ArticleList from "./ArticleList";


function Index() {
  const {
    token: { colorBgContainer, borderRadius },
  } = theme.useToken();
  console.log("home");

  return (
    <div className={styles.main}>
      <div className={styles.left} style={{ borderRadius: borderRadius }}>
        <ArticleList></ArticleList>
      </div>
      <div style={{ width: 15 }}></div>
      <div className={styles.info}>
        <Info></Info>
      </div>
    </div>
  );
}

export default Index;
