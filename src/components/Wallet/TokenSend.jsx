import { CreditCardOutlined } from "@ant-design/icons";
import { Button, Input, notification, message } from "antd";
import Text from "antd/lib/typography/Text";
import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import AddressInput from "components/AddressInput";
import AssetSelector from "components/Wallet/components/AssetSelector";

const styles = {
  card: {
    alignItems: "center",
    width: "100%",
  },
  header: {
    textAlign: "center",
  },
  input: {
    width: "100%",
    outline: "none",
    fontSize: "16px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textverflow: "ellipsis",
    appearance: "textfield",
    color: "#041836",
    fontWeight: "700",
    border: "none",
    backgroundColor: "transparent",
  },
  select: {
    marginTop: "20px",
    display: "flex",
    alignItems: "center",
  },
  textWrapper: { maxWidth: "80px", width: "100%" },
  row: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexDirection: "row",
  },
};

function TokenSend(props) {
  const { address:receiver, name } = props;
  const { Moralis } = useMoralis();
//   const [receiver, setReceiver] = useState();
  const [asset, setAsset] = useState();
  const [tx, setTx] = useState();
  const [amount, setAmount] = useState();
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    //   console.log("[TEST] SendTokens() ", { amount, receiver, asset, props });
    asset && amount && receiver ? setTx({ amount, receiver, asset }) : setTx();
  }, [asset, amount, receiver]);

  /*
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
  */
  
  /**
   * Transfer Assets
   */
  async function transfer() {
    const { amount, receiver, asset } = tx;

    let options = {};

    switch (asset.token_address) {
      case "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee":
        options = {
          native: "native",
          amount: Moralis.Units.ETH(amount),
          receiver,
          awaitReceipt: false,
        };
        break;
      default:
        options = {
          type: "erc20",
          amount: Moralis.Units.Token(amount, asset.decimals),
          receiver,
          contractAddress: asset.token_address,
          awaitReceipt: false,
        };
    }

    setIsPending(true);
    const txStatus = await Moralis.transfer(options);

    txStatus
      .on("transactionHash", (hash) => {
        // openNotification({message: "New Transaction", description: `${hash}`,});
        message.info("Initiated Transaction", 5);
        console.log("New Transaction", hash);
      })
      .on("receipt", (receipt) => {
        // openNotification({message: "New Receipt", description: `${receipt.transactionHash}`,});
        message.success("Transfer Successful", 6);
        console.log("New Receipt: ", receipt);
        setIsPending(false);
      })
      .on("error", (error) => {
        // openNotification({message: "Error", description: `${error.message}`,});
        message.error("Transaction Failed: " + error.message, 9);
        console.error(error);
        setIsPending(false);
      });
  }

  return (
    <div className="token_send" style={styles.card}>
      <div style={styles.tranfer}>
        {/*
        <div className="title" style={styles.header}>
          <h3>Send</h3>
        </div>
        */}
        {/*!receiver &&
        <div style={styles.select}>
          <div style={styles.textWrapper}>
            <Text strong>Address:</Text>
          </div>
          <AddressInput autoFocus onChange={setReceiver} />
        </div>
        */}
        <div style={styles.select}>
          <div style={styles.textWrapper}>
            <Text strong>Asset:</Text>
          </div>
          <AssetSelector setAsset={setAsset} style={{ width: "100%" }} className="inputEl" />
        </div>
        <div style={styles.select}>
          <div style={styles.textWrapper}>
            <Text strong>Amount:</Text>
          </div>
          <Input
            size="large"
            className="inputEl"
            prefix={<CreditCardOutlined />}
            onChange={(e) => {setAmount(`${e.target.value}`)}}
          />
        </div>
        <Button
          type="primary"
          size="large"
          loading={isPending}
          style={{ width: "100%", marginTop: "25px" }}
          onClick={() => transfer()}
          disabled={!tx}
          title={"Send Funds to "+receiver}
        >
          Send {name && <>&nbsp;to {name}</>}
        </Button>
      </div>
    </div>
  );
}

export default TokenSend;
