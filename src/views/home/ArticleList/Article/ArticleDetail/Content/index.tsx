import { memo, useEffect, useRef } from "react";

import "./MarkdownConfig/github-markdown.css";
import "./MarkdownConfig/github.css";

import styles from "./content.module.scss";

import { data } from "./MarkdownConfig/data2";
import { handleClick, scrollEventListener, md, navigation, initActive } from './custom-markdown-it';

function Content() {
  const contentRef = useRef(null);
  const navigationRef = useRef(null);

  const content = md.render(data);

  useEffect(() => {
    let container: any = contentRef.current;

    initActive(container);
    
    // 滚动监听
    const scrollHandler = () => {
      scrollEventListener(container);
    };
    window.addEventListener("scroll", scrollHandler);

    return () => {
      window.removeEventListener("scroll", scrollHandler);
    };
  }, []);

  return (
    <div className={styles.main}>
      <article
        ref={contentRef}
        className={styles.content + " markdown-body"}
        dangerouslySetInnerHTML={{ __html: content }}
      ></article>
      <div
        ref={navigationRef}
        className={styles.navigation}
        onClick={handleClick}
        dangerouslySetInnerHTML={{ __html: navigation }}
      ></div>
    </div>
  );
}

export default memo(Content);
