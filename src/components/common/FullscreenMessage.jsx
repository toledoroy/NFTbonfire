

const FullscreenMessage = (props) => {
    return (
        <div className='layover'>
            <div className='fullscreenMessage'>
                {props.children}
            </div>
        </div>
    );
}//FullscreenMessage()


export default FullscreenMessage;