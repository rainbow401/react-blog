export default {
  state: {
    num: 20
  },
  actions: {
    add1(newState: { num: number }, action: { type: string, val: number }) {
      newState.num++
    },
    add2(newState: { num: number }, action: { type: string, val: number }) {
      newState.num += action.val
    }
  },
  asyncActions: {
    // asyncAdd1: function (dispatch:Function) {
    //   setTimeout(() => {
    //     dispatch({type: 'add1'})
    //   }, 1000)
    // }
    asyncAdd1: function (dispatch : Function) {
      setTimeout(() => {
        console.log(11112321321)
        dispatch({type: 'add1'})
      }, 1000)
    }
  }
}