import { useChain } from "react-moralis";

/**
 * Component: Chain Change Screen
 * @param {*} props 
 * @returns 
 */
 function ChainChange(props){
    const { switchNetwork } = useChain();
    return (
        <div className="chain_change">
        <h2>We currently Support </h2>
        <p style={{ fontSize:'1.3rem', fontWeight:'500', lineHeight:'2rem', color:'var(--color)'}}>
            
            {/* Switch to Avalanche */}
            <button className="pointer btn-no" title="Avalanche Testnet" onClick={() => switchNetwork('0xa869')}>
                <svg width="120" height="120" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 10C0 4.47715 4.47715 0 10 0H20C25.5228 0 30 4.47715 30 10V20C30 25.5228 25.5228 30 20 30H10C4.47715 30 0 25.5228 0 20V10Z" fill="#E84142" />
                    <path d="M20.2914 15.3898C20.8111 14.4921 21.6497 14.4921 22.1693 15.3898L25.4056 21.0709C25.9252 21.9685 25.5 22.7008 24.4607 22.7008H17.941C16.9134 22.7008 16.4882 21.9685 16.9961 21.0709L20.2914 15.3898ZM14.0315 4.45277C14.5512 3.55513 15.378 3.55513 15.8977 4.45277L16.6182 5.75198L18.3189 8.74017C18.7323 9.59056 18.7323 10.5945 18.3189 11.4449L12.6142 21.3307C12.0945 22.1339 11.2323 22.6417 10.2756 22.7008H5.53942C4.50005 22.7008 4.07485 21.9803 4.59454 21.0709L14.0315 4.45277Z" fill="white" />
                </svg>
                <br />
                Avalanche Testnet
            </button>

            {/* Switch to Rinkeby
            <button className="pointer btn-no" title="Rinkeby Testnet" onClick={() => switchNetwork('0x4')}>
                    <svg width="120" height="120" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 10C0 4.47715 4.47715 0 10 0H20C25.5228 0 30 4.47715 30 10V20C30 25.5228 25.5228 30 20 30H10C4.47715 30 0 25.5228 0 20V10Z" fill="#627EEA" />
                        <path d="M15.0294 3.75V12.0656L22.0578 15.2062L15.0294 3.75Z" fill="white" fillOpacity="0.602" />
                        <path d="M15.0294 3.75L8 15.2062L15.0294 12.0656V3.75Z" fill="white" />
                        <path d="M15.0294 20.595V26.2453L22.0625 16.515L15.0294 20.595Z" fill="white" fillOpacity="0.602" />
                        <path d="M15.0294 26.2453V20.594L8 16.515L15.0294 26.2453Z" fill="white" />
                        <path d="M15.0294 19.2872L22.0578 15.2063L15.0294 12.0675V19.2872Z" fill="white" fillOpacity="0.2" />
                        <path d="M8 15.2063L15.0294 19.2872V12.0675L8 15.2063Z" fill="white" fillOpacity="0.602" />
                    </svg>
                <br />
                Rinkeby Testnet
            </button>
            */}
        </p>
    </div>
    );
}

export default ChainChange;