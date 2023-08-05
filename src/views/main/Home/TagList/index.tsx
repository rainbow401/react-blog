import React, { useState, memo } from "react";

import styles from "./tag-list.module.scss";

import { data } from "./tag";
import Tag from './Tag/index';
import { tagList } from "@/request/api";

function Index() {
  console.log("tagList");
  tagList().then((res) => {
    console.log(res);
  })
  const [selectId, setSelectId] = useState(-1);

  const handleClick = (id: number) => {
    console.log("handleClick");
    setSelectId(id);
  };

  return (
    <div className={styles.main}>
      {data.map((e: TagInfo) => (
        <div key={e.id} onClick={() => handleClick(e.id)}>
          <Tag key={e.id} tag={e} selected={selectId === e.id}></Tag>
        </div>
      ))}
    </div>
  );
}

export default memo(Index);
