import React, { memo } from "react";
import { useParams } from "react-router-dom";

import { theme } from "antd";

import styles from "./article-detail.module.scss";

import Action from "./Action";
import Content from "./Content";

const article: Article = {
  id: 1,
  title: "文章1手机打开老师叫啊打开链接阿斯利康的",
  author: "2",
  time: new Date(),
  content: "内容啥的流口水了叩丁狼撒开了都快撒开的喀什宽度a3",
  view: 1,
  like: 2,
  comment: 3,
  username: "闫志浩",
  tags: ["后端", "Java", "Spring"],
  heart: 1,
};

const ArticleDetail = React.memo(() => {
  const { id } = useParams();
  console.log(`ArticleDetail ${id}`);

  return (
    <div className={styles.main}>
      <div className={styles.action}>
        {/*<Action {...article} />*/}
      </div>
      <div className={styles.content}>
        <Content />
      </div>
    </div>
  );
});

export default ArticleDetail;
