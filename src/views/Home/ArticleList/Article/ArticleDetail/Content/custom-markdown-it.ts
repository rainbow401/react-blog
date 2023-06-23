
import hljs from "highlight.js";
import MarkdownIt from "markdown-it";
import mdKatex from "@traptitech/markdown-it-katex";
import markdownItAnchor from "markdown-it-anchor";
import mila from "markdown-it-link-attributes";
import markdownItTocDoneRight from "markdown-it-toc-done-right";

import styles from "./content.module.scss";



export let navigation = "";
export const md = new MarkdownIt({
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
          ignoreIllegals: false,
        }).value;
        console.log(
          "===",
          hljs.highlight(str, {
            language: lang,
            ignoreIllegals: false,
          })
        );
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
    return `<div id=navigation-index-${navigationIndex - 1} class="${
      styles.item
    }">${str}</div>`;
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

let currentTopNode: any;

export const scrollEventListener = (container: any): any => {
  if (container) {
    let topEle;
    const eles = container.querySelectorAll(
      `.${styles.content}> h1,h2`
    );

    for (let i = 0; i < eles.length; i++) {
      console.log(eles[i], eles[i].getBoundingClientRect());
      if (eles[i].getBoundingClientRect().top >= 0) {
        topEle = eles[i];
        break;
      }
    }

    if (topEle) {
      activeNavigation(topEle);
    }
  }
};


export const activeNavigation = (topEle: any) => {
  if (topEle.id) {
    const e = document.getElementById(`navigation-index-${topEle.id}`);
    if (e) {
      e.classList.add(`${styles.active}`);
      if (currentTopNode && e != currentTopNode) {
        currentTopNode.classList.remove(`${styles.active}`);
      }
      currentTopNode = e;
    }
  }
};

export const handleClick = (event: any) => {
  if (event.target && event.target.id) {
    event.preventDefault();
    const targetElement = document.getElementById(event.target.id.slice(17));
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  }
};

export const initActive = (container: any) => {
  if (container) {
    const eles = container.querySelectorAll(
      `.${styles.content}> h1,h2`
    );
    if (eles.length > 0) {
      const e = document.getElementById(`navigation-index-${eles[0].id}`);
      if (e) {
        e.classList.add(`${styles.active}`);
        currentTopNode = eles[0];
      }
    }
  }
}

