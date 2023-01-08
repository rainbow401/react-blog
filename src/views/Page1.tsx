import React from "react";
import {useSelector, useDispatch} from 'react-redux'
import {Button} from "antd";



const Page1: React.FC = () => {
  const {num} = useSelector((state: RootState) => ({
    num: state.num
  }))
  const dispatch = useDispatch();

  const changeNum = () => {
    dispatch({type:'add2', val: 300})
  }

  return (
    <div className={"home"}>
      <p>这是Page1组件</p>
      <p>{num}</p>
      <Button onClick={changeNum}>按钮</Button>
    </div>
  )
}

export default Page1