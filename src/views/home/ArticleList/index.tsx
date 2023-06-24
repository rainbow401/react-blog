import React from "react";

import { Card } from "antd";

import styles from "./article-list.module.scss";
import './antd-ovrried.css'

import Article from "./Article";

const data: Array<Article> = [
  {
    id: 1,
    title: "文章1手机打开老师叫啊打开链接阿斯利康的",
    author: "2",
    time: new Date(),
    content: "内容啥的；流口水了；叩丁狼；撒开；了都快撒开的；喀什；宽度；a3",
    view: 1,
    like: 2,
    comment: 3,
    username: "闫志浩",
    tags: ["后端", "Java", "Spring"],
  },
  {
    id: 2,
    title: "文章1手机打开老师叫啊打开链接阿斯利康的",
    author: "2",
    time: new Date(),
    content: "内容啥的；流口水了；叩丁狼；撒开；了都快撒开的；喀什；宽度；a3",
    view: 1,
    like: 2,
    comment: 3,
    username: "yzh",
    tags: ["后端", "Java", "Spring"],
  },
  {
    id: 3,
    title: "文章1手机打开老师叫啊打开链接阿斯利康的",
    author: "2",
    time: new Date(),
    content: "内容啥的；流口水了；叩丁狼；撒开；了都快撒开的；喀什；宽度；a3",
    view: 1,
    like: 2,
    comment: 3,
    username: "12321",
    tags: ["后端", "Java", "Spring"],
  },
  {
    id: 4,
    title: "文章1手机打开老师叫啊打开链接阿斯利康的",
    author: "2",
    time: new Date(),
    content: "内容啥的；流口水了；叩丁狼；撒开；了都快撒开的；喀什；宽度；a3",
    view: 1,
    like: 2,
    comment: 3,
    username: "12321",
    tags: ["后端", "Java", "Spring"],
  },
];

function ArticleList() {
  console.log("ArticleList");
  return (
    <div className={styles.main}>
      {data.map((e: Article) => (
        <Article key={e.id} {...e}></Article>
      ))}
    </div>
  );
}

export default ArticleList;
