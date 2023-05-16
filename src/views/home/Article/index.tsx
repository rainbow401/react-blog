import React from "react";
import PropTypes from "prop-types";
import styles from './article.module.scss'

function Article(props: any) {
  console.log(props);
  return (
    <div className={styles.actions}>
      <div className={styles.actionItem}> 查看数：{props.view}</div>
      <div className={styles.actionItem}>点赞数：{props.like}</div>
      <div className={styles.actionItem}>评论数：{props.comment}</div>
    </div>
  );
}

Article.propTypes = {};

export default Article;
