
const FullscreenMessage = (props) => {
    return (
        <div className='layover'>
            <div className='fullscreenMessage framed container'>
                {props.children}
            </div>
        </div>
    );
}//FullscreenMessage()


export default FullscreenMessage;