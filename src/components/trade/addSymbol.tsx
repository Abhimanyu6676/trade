import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Form from "react-bootstrap/esm/Form";
import InputGroup from "react-bootstrap/esm/InputGroup";
import { IoSearch } from "react-icons/io5";
import socketService from "../../services/socketService";
import { getStockKeyId } from "../../util/helper";

export const AddSymbol = () => {
  const [symbol, setSymbol] = useState<string>("");
  const [selectedStock, setSelectedStock] =
    useState<searchSymbolResponseData_i>();
  const [symbolExchange, setSymbolExchange] = useState<"NSE" | "BSE">("BSE");
  const [searchList, setSearchList] = useState<searchSymbolResponseData_i[]>(
    [],
  );

  const searchSymbol = async () => {
    if (symbol) {
      console.log("Searching Symbol: ", symbol, " on ", symbolExchange);
      socketService.sendOrderCmd({
        cmd: "searchSymbol",
        data: { symbol, exchange: symbolExchange },
      });
    } else {
      console.log("Search Symbol cannot be empty");
    }
  };

  useEffect(() => {
    socketService.socketMessageSubscriberList.subscribe({
      id: "searchSymbolComp",
      callback: (data) => {
        console.log("message in searchSymbolComp inside subscribed callback");
        console.log(data);
        if (data.type == "searchSymbolResults") {
          setSearchList(data.symbols);
        }
      },
    });
    return () => {
      socketService.socketMessageSubscriberList.unSubscribe("searchSymbolComp");
    };
  }, []);

  return (
    <div
      style={{
        //backgroundColor: "red",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div // search input field
        style={{
          //backgroundColor: "green",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <InputGroup className="">
          <DropdownButton variant="outline-secondary" title={symbolExchange}>
            <Dropdown.Item
              onClick={() => {
                setSymbolExchange("NSE");
              }}
            >
              NSE
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => {
                setSymbolExchange("BSE");
              }}
            >
              BSE
            </Dropdown.Item>
          </DropdownButton>
          <SymbolSelector
            searchList={searchList}
            setSymbol={setSymbol}
            setSelectedStock={setSelectedStock}
          />
          <Form.Control
            placeholder="Add Symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") searchSymbol();
            }}
            style={{ width: 200, height: 40, fontSize: 15 }}
          />
          <Button variant="outline-secondary" onClick={searchSymbol}>
            <IoSearch style={{ padding: 0, margin: 0 }} />
          </Button>
        </InputGroup>
      </div>
      <div style={{ marginLeft: 30 }}>
        <Button
          variant="primary"
          onClick={() => {
            console.log("socket.io serviceID = ", socketService.classID);
            if (selectedStock && symbolExchange) {
              socketService.sendOrderCmd({
                cmd: "addSymbol",
                data: {
                  key_id: getStockKeyId(selectedStock),
                  name: selectedStock.name,
                  symbol: selectedStock.symbol,
                  brSymbol: selectedStock.brsymbol,
                  exchange: selectedStock.exchange,
                },
              });

              setSymbol("");
              setSelectedStock(undefined);
              setSearchList([]);
            } else {
              console.log("Symbol and Exchange cannot be empty");
            }
          }}
        >
          Add Symbol
        </Button>
      </div>
    </div>
  );
};
const SymbolSelector = (props: {
  searchList: searchSymbolResponseData_i[];
  setSelectedStock: React.Dispatch<
    React.SetStateAction<searchSymbolResponseData_i | undefined>
  >;
  setSymbol: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    //console.log("SymbolSelector Effect ran");
    if (props.searchList?.length) {
      setShowDropdown(true);
    }

    return () => {};
  }, [props.searchList]);

  return (
    <>
      <DropdownButton
        variant="outline-secondary"
        id="input-group-dropdown-2"
        title={""}
        disabled={props.searchList?.length === 0}
        show={showDropdown}
        onToggle={() => {
          setShowDropdown(!showDropdown);
        }}
      >
        {props.searchList?.map((stock, index) => (
          <Dropdown.Item
            key={index}
            onClick={() => {
              props.setSelectedStock(stock);
              props.setSymbol(stock.symbol);
              setShowDropdown(false);
            }}
          >
            {stock.symbol}
          </Dropdown.Item>
        ))}
      </DropdownButton>
    </>
  );
};
