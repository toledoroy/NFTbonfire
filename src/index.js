import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { MoralisProvider } from "react-moralis";
import "./index.css";
import QuickStart from "components/QuickStart";
// import { MoralisDappProvider } from "./providers/MoralisDappProvider/MoralisDappProvider";
// import { PersonaContext } from "common/context";
// import { useMoralis } from "react-moralis";
// import { Provider } from 'react-redux'
// import store from './store'


/** Get your free Moralis Account https://moralis.io/ */

const APP_ID = process?.env?.REACT_APP_MORALIS_APPLICATION_ID;
const SERVER_URL = process?.env?.REACT_APP_MORALIS_SERVER_URL;

const Application = () => {
  const isServerInfo = APP_ID && SERVER_URL ? true : false;

  //Validate
  if (!APP_ID || !SERVER_URL) throw new Error("Missing Moralis Application ID or Server URL. Make sure to set your .env file.");
  if (isServerInfo)
    return (
      <MoralisProvider appId={APP_ID} serverUrl={SERVER_URL}>
        {/* <PersonaContext.Provider value={{persona, setPersona}}> */}
        {/* <Provider store={store}> */}
        <App isServerInfo />
        {/* </Provider> */}
        {/* </PersonaContext.Provider> */}
      </MoralisProvider>
    );
  else {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <QuickStart />
      </div>
    );
  }
};

ReactDOM.render(
  // <React.StrictMode>
  <Application />,
  // </React.StrictMode>,
  document.getElementById("root")
);
