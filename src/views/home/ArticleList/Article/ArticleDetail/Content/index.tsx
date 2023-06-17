import React, {memo} from "react";

import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import "./hljs.css";

import mila from "markdown-it-link-attributes";
import mdKatex from "@traptitech/markdown-it-katex";
import markdownItAnchor from "markdown-it-anchor";

import markdownItTocDoneRight from "markdown-it-toc-done-right";

import styles from "./content.module.scss";
import { data } from "./data";

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
  typographer: true,
  highlight: (str: string, lang: string, attrs: string): string => {
    let content = str;
    console.log(content, attrs, "high");
    if (lang && hljs.getLanguage(lang)) {
      try {
        content = hljs.highlight(str, {
          language: lang,
          ignoreIllegals: true,
        }).value;
      } catch (e) {
        console.log(e);
        return str;
      }
    } else {
      content = md.utils.escapeHtml(str);
    }
    return `<pre class="hljs ${styles.pre}"><code>${content}</code></pre>`;
  },
});

//  数学公式
md.use(mdKatex, {
  blockClass: "katexmath-block rounded-md p-[10px]",
  errorColor: " #cc0000",
});
// 链接
md.use(mila, { attrs: { target: "_blank", rel: "noopener" } });

// 导航
let navigation = "";
md.use(markdownItTocDoneRight, {
  containerClass: "toc",
  containerId: "toc",
  listType: "ul",
  listClass: "listClass",
  itemClass: "itemClass",
  linkClass: "linkClass",
  callback: function (html, ast) {
    //把目录单独列出来
    navigation = html;
    // console.log(html, ast);
  },
});
// 导航跳转
md.use(markdownItAnchor, {
  permalink: false,
  permalinkBefore: true,
  permalinkSymbol: "#",
  level: 1  
});

// 使用插件函数
md.use((md) => {
  // 在解析过程的指定阶段触发插件函数
  md.core.ruler.before('inline', 'getCodeTags', getCodeTags);
});



// 定义插件函数，在解析过程中捕获 <code> 标签内容
function getCodeTags(state: any) {
  const tokens = state.tokens;

  // 遍历所有解析的 token
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    // console.log(token)

    // if (token.content ==='单行代码：') {
    //   console.log(token)
    // }

    JSON.stringify(token);
    if (JSON.stringify(token).includes('单行')) {
      console.log(token, '===')

      if (token.children) {
            if (Array.isArray(token.children)) {
              console.log("=====", token.children, token.children.length[0], token.children.toString())
            }
          }
    }
    // if (token.type === 'inline') {
    //   console.log(token, 'code---1');
    //   if (token.children) {
    //     if (Array.isArray(token.children)) {
    //       console.log("=====", token.children, token.children.length, token.children.toString())
    //     }
    //     console.log(token, 'code---2', token.children.length);
    //   }
    //   for (let index = 0; index < token.children.length; index++) {
    //     const element = token.children[index];
    //     console.log(element, 'ele')
    //     if (element.type === 'code_inline' && element.tag === 'code') {
    //       console.log(token, 'code---3');
    //     }
    //   }
    // }
    // 找到 <code> 标签的起始标记
    if (token.type === 'inline' && token.tag === 'code' && token.info === '') {
      // 获取 <code> 标签的内容
      const codeContent = token.content;

      // 在这里对获取的 <code> 标签内容进行处理
      console.log('Code content:', codeContent);
    }
  }
}


function Content() {
  const content = md.render(data);

  return (
    <div className={styles.main}>
      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: content }}
      ></div>
      <div className={styles.navigation}>
        <div dangerouslySetInnerHTML={{ __html: navigation }}></div>
      </div>
    </div>
  );
}

export default memo(Content);
