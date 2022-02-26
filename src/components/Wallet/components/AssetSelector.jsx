import { useERC20Balance } from "hooks/useERC20Balance";
import { useMoralis, useNativeBalance } from "react-moralis";
import { Image, Select } from "antd";
import { useMemo } from "react";

export default function AssetSelector(props) {
  const { setAsset, style } = props;
  const { assets } = useERC20Balance();
  const { data: nativeBalance, nativeToken } = useNativeBalance();
  const { Moralis } = useMoralis();

  const fullBalance = useMemo(() => {
    if (!assets || !nativeBalance) return null;
    // console.warn("[TEST] AssetSelector", { assets, nativeToken });
    return [
      ...assets,
      {
        balance: nativeBalance.balance,
        decimals: nativeToken?.decimals,
        name: nativeToken?.name,
        symbol: nativeToken?.symbol,
        token_address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      },
    ];
  }, [assets, nativeBalance, nativeToken]);

  function handleChange(value) {
    const token = fullBalance.find((token) => token.token_address === value);
    setAsset(token);
  }
  /**
   * Get Value
   * @param {*} item 
   * @returns 
   */
  function getValue(item) {
    try {
      return parseFloat(Number(Moralis?.Units?.FromWei(item.balance, item.decimals))?.toFixed(6));
    } catch (error) {
      console.error("[CAUGHT] AssetSelector Error", { item, error });
      return 0;
    }
  }
  return (
    <Select onChange={handleChange} size="large" style={style} placeholder={props.placeholder}>
      {fullBalance &&
        fullBalance.map((item, key) => (
          <Select.Option value={item["token_address"]} key={item["token_address"]}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                gap: "8px",
              }}
            >
              <Image
                src={item.logo || "https://etherscan.io/images/main/empty-token.png"}
                alt="nologo"
                width="24px"
                height="24px"
                preview={false}
                style={{ borderRadius: "15px" }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "90%",
                }}
              >
                {/* {console.warn("[TEST] AssetSelector Balance:" + item.balance, { item })} */}
                <p>{item.symbol}</p>
                <p style={{ alignSelf: "right" }}>
                  ({getValue(item)})
                </p>
              </div>
            </div>
          </Select.Option>
        ))}
    </Select>
  );
}
