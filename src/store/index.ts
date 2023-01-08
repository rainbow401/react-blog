import {legacy_createStore} from 'redux'
import reducer from './reducer.ts'

// 创建仓库
const store = legacy_createStore(
  reducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);
export default store