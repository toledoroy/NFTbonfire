import { Spin, Alert } from 'antd';

const Spinner = (props) => {
    return (
        <Spin tip="Loading...">
            <Alert message={props.message} description={props.description} type={props.type || "info"} />
        </Spin>
    );
}//Spinner()


export default Spinner;