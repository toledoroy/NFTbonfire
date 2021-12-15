import { Result, Button } from 'antd';
import { Link } from "react-router-dom";

/**
 * 404 Page
 */
function Page404(props){
  return (<Result status="404" title="404" subTitle="Sorry, the page you're looking for does not exist." extra={
    <Link to={{pathname:'/'}}><Button type="primary">Back Home</Button></Link>
  } />);

    // return (
    //   <div>
    //     <h1>404</h1>
    //     <p>Page not found</p>
    //   </div>
    // )
  }//Page404()

export default Page404;