import {useState} from 'react'
import {useRoutes} from "react-router-dom";
import router from "./router"

function App() {
  const [count, setCount] = useState(0)
  const outlet = useRoutes(router);
  return (
    <div className="App" style={{height: '100vh'}}>
      {/*<Link to={"/home"}>home</Link>|*/}
      {/*<Link to={"/about"}>about</Link>*/}
      {/*<Link to={"/user"}>user</Link>*/}
      {/*占位符，类似于窗口来展示组件的*/}
      {outlet}
    </div>
  )
}

export default App
