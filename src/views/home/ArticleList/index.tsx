import React from "react";

import { Card } from "antd";

import styles from "./article-list.module.scss";
import Article from "./Article";


const data: Array<Article> = [
  {
    title: "文章1手机打开老师叫啊打开链接阿斯利康的",
    author: "2",
    time: new Date(),
    content: "内容啥的；流口水了；叩丁狼；撒开；了都快撒开的；喀什；宽度；a3",
    view: 1,
    like: 2,
    comment: 3,
    username: '闫志浩',
    tags: ['后端','Java','Spring']
  },
  {
    title: "文章1手机打开老师叫啊打开链接阿斯利康的",
    author: "2",
    time: new Date(),
    content: "内容啥的；流口水了；叩丁狼；撒开；了都快撒开的；喀什；宽度；a3",
    view: 1,
    like: 2,
    comment: 3,
    username: 'yzh',
    tags: ['后端','Java','Spring']
  },{
    title: "文章1手机打开老师叫啊打开链接阿斯利康的",
    author: "2",
    time: new Date(),
    content: "内容啥的；流口水了；叩丁狼；撒开；了都快撒开的；喀什；宽度；a3",
    view: 1,
    like: 2,
    comment: 3,
    username: '12321',
    tags: ['后端','Java','Spring']
  },
];

function ArticleList() {

  return (
    <div>
      {data.map((e: Article) => (
        <Article {...e}></Article>
      ))}
    </div>
  );
}

export default ArticleList;
