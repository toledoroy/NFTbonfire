import { Result, Button } from 'antd';
import { Link } from "react-router-dom";

/**
 * 404 Page
 */
function Page404(props){
  return (<Result status="404" title="404" subTitle={
    <div>
      <p>Oh no, you might be lost.</p>
    </div>
  } extra={
    <>
    <p>Maybe go </p>
    <Link to={{pathname:'/'}}><Button type="primary">Back Home</Button></Link>
    </>
  } />);

    // return (
    //   <div>
    //     <h1>404</h1>
    //     <p>Page not found</p>
    //   </div>
    // )
  }//Page404()

export default Page404;