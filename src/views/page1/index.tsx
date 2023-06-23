import React from "react";
import {useSelector, useDispatch} from 'react-redux'
import {Button, message} from "antd";
// import NumStatus from "@/store/ArrayStatus/reducer";
import numStatus from "@/store/NumStatus";

import styles from './page1.module.scss';


const Index: React.FC = () => {

  const dispatch = useDispatch();

  // num 操作
  const {num} = useSelector((state: RootState) => ({
    num: state.handleNum.num
  }))
  console.log(num);
  const changeNum = () => {
    dispatch({type:'add2', val: 300})
  }
  const changeNum2 = () => {
    numStatus.asyncActions.asyncAdd1(dispatch);
    // dispatch(numStatus.asyncActions.asyncAdd1)
    // dispatch(({type: 'add1'}) => )
  }

  // arr 操作
  const {sarr} = useSelector((state: RootState)=> ({
    sarr: state.handleArray.sarr
  }))
  console.log(sarr);

  return (
    <div className={styles.main}>
      111
      <div>
        <p>这是Page1组件</p>
        <p>{num}</p>
        <Button onClick={changeNum}>同步按钮</Button>
        <Button onClick={changeNum2}>异步按钮</Button>
        <p>{sarr}</p>
      </div>

    </div>
  )
}

export default Index