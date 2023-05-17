import React from "react";
import PropTypes from "prop-types";

import styles from './title.module.scss'

const formatTime = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2);
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${month}月${day}日`;
};

function Title(props: {
  title: string;
  time: Date;
  username: string;
  tags: string[];
}) {


  return (
    <div>
      <div>
        <ul className={styles.items}>
          <li>{props.username}</li>
          <li>{formatTime(props.time)}</li>
          <li className={styles.tags}>
            <div>{props.tags[0]}</div>
            <div>{props.tags[1]}</div>
          </li>
        </ul>
      </div>
      <div className={styles.title}>{props.title}</div>
    </div>
  );
}

Title.propTypes = {};

export default Title;
