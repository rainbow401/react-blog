import handleNum from "@/store/NumState";

const defaultState = {
  ...handleNum.state
}
let reducer = (state = defaultState, action: { type: string, val: number }) => {

  console.log('reducer doing')
  let newState = JSON.parse(JSON.stringify(state))

  switch (action.type) {
    case handleNum.add1: {
      // @ts-ignore
      handleNum.actions[handleNum.add1](newState, action)
      break;
    }
    case handleNum.add2: {
      // @ts-ignore
      handleNum.actions[handleNum.add2](newState, action)
      break;
    }
    default: break;
  }
  return newState;
}


export default reducer