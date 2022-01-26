import { Button, Card, Input, Typography, Form, notification, Select } from "antd";
import { useMemo, useState } from "react";

import Address from "components/Address/Address";
import { useMoralis, useMoralisQuery } from "react-moralis";
import { getEllipsisTxt } from "helpers/formatters";
import { useEffect } from "react";
// import { Contract } from "objects/objects";

const { Text } = Typography;


// import contractInfo from "contracts/contractInfo.json";
//Persona ABI
// import personaABI from "contracts/abi/PERSONA.json";
// const personaABI = require('contracts/abi/PERSONA.json');
//Flat Instance
// const personaContract = { 
//   address: '0x9E91a8dDF365622771312bD859A2B0063097ad34', 
//   chain:4,
//   abi: personaABI,
//   name:'PERSONA',
// };


export default function Contract() {
  const { Moralis, chainId, isWeb3Enabled } = useMoralis();
  const [responses, setResponses] = useState({});
  const [allContracts, setAllContracts] = useState([]);
  const [contract, setContractActual] = useState(null);
  // const [contractId, setContractId] = useState(null);
  // const [contract, setContractActual] = useState(personaContract);  //Testing

  //Set Contract Wrapper
  const setContract = (contract) => {
    console.warn("[DEV] setContract() Setting Contract:", contract);
    //Resolve ABI
    if(typeof contract?.abi === 'string') contract.abi = JSON.parse(contract.abi);
    setContractActual(contract);
  }

  useEffect(() => {
    console.error('Contract() Running Contract Query', {isWeb3Enabled})
    if(isWeb3Enabled){
      const query = new Moralis.Query("Contract");
      query.equalTo("chain", chainId);
      // query.equalTo("address", address);
      query.find().then(results =>{
        console.error("Contract() Found "+results.length+" Contracts:", {results})
        if(results.length>0){
          setAllContracts(results);
          //Default to First
          setContract({...results[0].attributes});
        } 
        else setContract(null); //Unset Current Contract
      })
      .catch(err => console.error("[CAUGHT] Contract() Error:", {err, query}))
    }
  },[chainId, isWeb3Enabled, Moralis.Query]);
  //TODO: use contract State Instead of hardcoded Stuff

  
  // console.log("Contract() Perosna Contract:", personaContract);
  // const { contractName, networks, abi } = contractInfo;
  // const contractAddress = personaContract.address;
  // const abi = personaContract.abi;
  // const contractName = personaContract.name;
  // const contractAddress = networks[1337].address;
  // const contractAddress = '0x88b48f654c30e99bc2e4a1559b4dcf1ad93fa656';
  // let contractName = 'OpenSea Collections';
  // let abi = Moralis.Web3.abis.erc1155;


  /**Live query */
  const { data } = useMoralisQuery("Events", (query) => query, [], {live: true,});


  const displayedContractFunctions = useMemo(() => {
    if (!contract?.abi) return [];
    return contract.abi.filter((method) => method["type"] === "function");
  // }, [abi]);
  }, [contract]);

  const openNotification = ({ message, description }) => {
    notification.open({
      placement: "bottomRight",
      message,
      description,
      onClick: () => {
        console.log("Notification Clicked!");
      },
    });
  };
  if(!contract) return (<h2>No Contract Selected</h2>);

  return (
    <div style={{ margin: "auto", display: "flex", gap: "20px", marginTop: "25", width: "70vw" }}>
      <Card
        title={
          <div style={{ justifyContent: "space-between", alignItems: "center" }}>
            {/* Your contract: {contractName} */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {contract?.name && <span>Contract: {contract.name}</span>}
              <div className="contract_select">
                {console.warn("[TEST] Contract Select", {allContracts})}
                <Select label="Contract" name="contract" selected={contract.id}
                  onChange={(item) => { console.warn("Selected Item:", item); }}
                  >
                    {allContracts.map((item, index) => ( 
                      <Select.Option key={item.id}>{item?.get('name')}</Select.Option>
                    ))}
                </Select>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Address avatar="right" copyable address={contract.address} size={8} />
            </div>
          </div>
        }
        size="large"
        style={{
          width: "60%",
          boxShadow: "0 0.5rem 1.2rem rgb(189 197 209 / 20%)",
          border: "1px solid #e7eaf3",
          borderRadius: "0.5rem",
        }}
      >
        <Form.Provider
          onFormFinish={async (name, { forms }) => {
            const params = forms[name].getFieldsValue();

            let isView = false;

            // for (let method of abi) {
            for (let method of contract.abi) {
              if (method.name !== name) continue;
              if (method.stateMutability === "view") isView = true;
            }

            const options = {
              contractAddress: contract.address,
              functionName: name,
              // abi,
              abi: contract.abi,
              params,
            };

            if (!isView) {
              const tx = await Moralis.executeFunction({ awaitReceipt: false, ...options });
              tx.on("transactionHash", (hash) => {
                setResponses({ ...responses, [name]: { result: null, isLoading: true } });
                openNotification({
                  message: "? New Transaction",
                  description: `${hash}`,
                });
                console.log("? New Transaction", hash);
              })
                .on("receipt", (receipt) => {
                  setResponses({ ...responses, [name]: { result: null, isLoading: false } });
                  openNotification({
                    message: "? New Receipt",
                    description: `${receipt.transactionHash}`,
                  });
                  console.log("? New Receipt: ", receipt);
                })
                .on("error", (error) => {
                  console.error(error);
                });
            } else {
              console.log("options", options);
              Moralis.executeFunction(options).then((response) =>
                setResponses({ ...responses, [name]: { result: response, isLoading: false } })
              );
            }
          }}
        >
          {displayedContractFunctions &&
            displayedContractFunctions.map((item, key) => (
              <Card title={`${key + 1}. ${item?.name}`} size="small" style={{ marginBottom: "20px" }}>
                <Form 
                  name={`${item.name}`}
                  labelCol={{ span: 6, }}
                  wrapperCol={{ span: 18, }}
                  >
                  {item.inputs.map((input, key) => (
                    <Form.Item
                      label={input.name}
                      name={input.name}
                      required
                      style={{ marginBottom: "15px" }}
                    >
                      {/* <Input placeholder={`${input.name} (${input.type})`} /> */}
                      <Input placeholder={input.type} />
                    </Form.Item>
                  ))}
                  
                  <Form.Item style={{ marginBottom: "5px" }}>
                    <Text style={{ display: "block" }}>{responses[item.name]?.result && `Response: ${JSON.stringify(responses[item.name]?.result)}`}</Text>
                    <Button type="primary" htmlType="submit" loading={responses[item?.name]?.isLoading}>
                      {item.stateMutability === "view" ? "Read" : "Transact"}
                    </Button>
                  </Form.Item>

                </Form>
              </Card>
            ))}
        </Form.Provider>
      </Card>
      <Card
        title={"Contract Events"}
        size="large"
        style={{
          width: "40%",
          boxShadow: "0 0.5rem 1.2rem rgb(189 197 209 / 20%)",
          border: "1px solid #e7eaf3",
          borderRadius: "0.5rem",
        }}
      >
        {data.map((event, key) => (
          <Card title={"Transfer event"} size="small" style={{ marginBottom: "20px" }}>
            {getEllipsisTxt(event.attributes.transaction_hash, 14)}
          </Card>
        ))}
      </Card>
    </div>
  );
}
