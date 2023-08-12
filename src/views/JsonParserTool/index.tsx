import React, {memo, useState} from "react";
import styles from './json.tool.module.scss'
import {Button, Tree} from "antd";
import TextArea from "antd/es/input/TextArea";
import {data} from './data2';
import convertTree, {DataNode} from './convert'

function index() {
  const [value, setValue] = useState('');
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const format = () => {

    console.log('JSON.parse(data)', JSON.parse(data))
    const treeData: DataNode = convertTree(JSON.parse(data));
    let children: DataNode[];
    if (treeData.children) {
      children = treeData.children;
    } else {
      children = [];
    }
    setTreeData(children);
  }


  return (
      <div className={styles.main}>
        <div className={styles.jsonContent}>
          <div className={styles.title}>Json数据</div>
          <div className={styles.action}>
            <Button size={'small'} onClick={format}>格式化</Button>
          </div>
          <div className={styles.content}>
            <TextArea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder=""
                autoSize={{minRows: 19, maxRows: 19}}
                bordered={false}
            />
          </div>
        </div>
        <div className={styles.viewContent}>
          <div className={styles.title}>视图</div>
          <div className={styles.content}>
            <div>
              <Tree treeData={treeData}/>
            </div>
          </div>
        </div>
      </div>
  );
}

export default memo(index);
