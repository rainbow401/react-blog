import handler from "./index";

let reducer = (state = {...handler.state}, action: { type: string, val: number }) => {
  let newState = JSON.parse(JSON.stringify(state))
  for (let key in handler.actions) {
    if (action.type === key) {
      handler.actions[key](newState, action)
      break;
    }
  }

  return newState;
}




export default reducer