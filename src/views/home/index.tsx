import { theme } from "antd";

import styles from "./home.module.scss";

import Info from "@/views/Home/Info";
import ArticleList from "./ArticleList";
import TagList from "./TagList";

function Index() {
  console.log("home");

  return (
    <div className={styles.main}>
      <div className={styles.left}>
        <div className={styles.tag}>
          <TagList></TagList>
        </div>
      </div>
      <div className={styles.mid}>
        <ArticleList></ArticleList>
      </div>
      <div className={styles.info}>
        <Info></Info>
      </div>
    </div>
  );
}

export default Index;
