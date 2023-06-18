import { memo, useEffect, useRef } from "react";

import hljs from "highlight.js";
import MarkdownIt from "markdown-it";
import "./github-dark-dimmed.css";

import mdKatex from "@traptitech/markdown-it-katex";
import markdownItAnchor from "markdown-it-anchor";
import mila from "markdown-it-link-attributes";

import markdownItTocDoneRight from "markdown-it-toc-done-right";

import styles from "./content.module.scss";
import { data } from "./data2";

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
  typographer: true,
  highlight: (str: string, lang: string, attrs: string): string => {
    let content = str;
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
let navigationIndex = 0;
md.use(markdownItTocDoneRight, {
  containerClass: "toc",
  containerId: "toc",
  listType: "ul",
  listClass: `${styles.listClass}`,
  itemClass: `${styles.itemClass}`,
  linkClass: `${styles.linkClass}`,
  callback: function (html: string, ast: any) {
    //把目录单独列出来
    navigation = html;
  },
  level: [1, 2],
  slugify: (str: string) => {
    return `${navigationIndex++}`;
  },
  format: (str: string) => {
    return `<div id=navigation-index-${navigationIndex - 1}>${str}</div>`;
  },
});
// 文章内容标题标签设置id
let anchorIndex = 0;
md.use(markdownItAnchor, {
  level: [1, 2],
  slugify: (str: string) => {
    return `${anchorIndex++}`;
  },
});

function Content() {
  const content = md.render(data);
  const contentRef = useRef(null);
  const navigationRef = useRef(null);

  useEffect(() => {
    const containerNode: any = contentRef.current;
    let currentNode: any;
    const handleScroll = () => {
      if (containerNode) {
        let topEle;
        const eles: any[] = containerNode.querySelectorAll(
          `.${styles.content}> h1,h2`
        );

        for (let i = 0; i < eles.length; i++) {
          if (eles[i].getBoundingClientRect().top > 0) {
            topEle = eles[i];
            break;
          }
        }

        if (topEle) {
          activeNavigation(topEle);
        }
      }
    };

    const activeNavigation = (topEle: any) => {
      if (topEle.id) {
        const e = document.getElementById(`navigation-index-${topEle.id}`);
        if (e) {
          e.classList.add(`${styles.active}`);
          if (currentNode && e != currentNode) {
            currentNode.classList.remove(`${styles.active}`);
          }
          currentNode = e;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleClick = (event: any) => {
    // console.log(event.target.id.slice(17));
    if (event.target.id) {
      event.preventDefault();
      const targetElement = document.getElementById(event.target.id.slice(17));
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div className={styles.main}>
      <div
        ref={contentRef}
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: content }}
      ></div>
      <div ref={navigationRef} className={styles.navigation}>
        <div
          className={styles.item}
          onClick={handleClick}
          dangerouslySetInnerHTML={{ __html: navigation }}
        ></div>
      </div>
    </div>
  );
}

export default memo(Content);
