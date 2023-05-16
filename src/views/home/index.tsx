import React from "react";

import { Card, theme } from "antd";

import styles from "./home.module.scss";
import Info from "@/views/home/Info";
import Article from "./Article";

function Index() {
  const {
    token: { colorBgContainer, borderRadius },
  } = theme.useToken();

  interface Article {
    title: string;
    author: string;
    date: Date;
    content: string;
    view: number;
    like: number;
    comment: number;
  }

  const data: Array<Article> = [
    {
      title: "文章1手机打开老师叫啊打开链接阿斯利康的",
      author: "2",
      date: new Date(),
      content: "内容啥的；流口水了；叩丁狼；撒开；了都快撒开的；喀什；宽度；a3",
      view: 1,
      like: 2,
      comment: 3,
    },{
      title: "文章1手机打开老师叫啊打开链接阿斯利康的",
      author: "2",
      date: new Date(),
      content: "内容啥的；流口水了；叩丁狼；撒开；了都快撒开的；喀什；宽度；a3",
      view: 1,
      like: 2,
      comment: 3,
    },{
      title: "文章1手机打开老师叫啊打开链接阿斯利康的",
      author: "2",
      date: new Date(),
      content: "内容啥的；流口水了；叩丁狼；撒开；了都快撒开的；喀什；宽度；a3",
      view: 1,
      like: 2,
      comment: 3,
    },
  ];

  return (
    <div className={styles.main}>
      <div className={styles.left} style={{ borderRadius: borderRadius }}>
        {data.map((e: Article) => (
          <Card
            className={styles.card}
            title={e.title}
            hoverable={true}
            bordered={false}
            actions={[<Article {...e}></Article>, <Article {...e}></Article>]}
          >
            {e.content}
          </Card>
        ))}
      </div>
      <div style={{ width: 15 }}></div>
      <div className={styles.info}>
        <Info></Info>
      </div>
    </div>
  );
}

export default Index;
