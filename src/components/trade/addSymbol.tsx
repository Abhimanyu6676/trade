import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Form from "react-bootstrap/esm/Form";
import InputGroup from "react-bootstrap/esm/InputGroup";
import { IoSearch } from "react-icons/io5";
import store from "../../redux";
import eventBus from "../../util/eventBus";
import { getStockKeyId } from "../../../../backend/src/util/helper";

export const AddSymbol = () => {
  const [symbol, setSymbol] = useState<string>("");
  const [selectedStock, setSelectedStock] = useState<searchSymbolResponseData_i>();
  const [symbolExchange, setSymbolExchange] = useState<"NSE" | "BSE">("BSE");
  const [searchList, setSearchList] = useState<searchSymbolResponseData_i[]>([]);

  const searchSymbol = async () => {
    if (symbol) {
      console.log("Searching Symbol: ", symbol, " on ", symbolExchange);
      eventBus.emitEvent({
        type: "OPENALGO",
        action: { type: "SEARCH_SYMBOL", data: { searchText: symbol, userId: store.getState().user?.user?.id ?? "" } },
      });
    } else {
      console.log("Search Symbol cannot be empty");
    }
  };

  const addSymbol = async () => {
    if (selectedStock && symbolExchange) {
      eventBus.emitEvent({
        type: "OPENALGO",
        action: {
          type: "ADD_STOCK",
          data: {
            stocks: [
              {
                keyId: getStockKeyId({
                  userId: store.getState().user.user?.id ?? "",
                  symbol: selectedStock.symbol,
                  exchange: selectedStock.exchange,
                }),
                name: selectedStock.name,
                symbol: selectedStock.symbol,
                brSymbol: selectedStock.brsymbol,
                exchange: selectedStock.exchange,
              },
            ],
            userId: store.getState().user.user?.id ?? "",
          },
        },
      });
      setSymbol("");
      setSelectedStock(undefined);
      setSearchList([]);
    } else {
      console.log("Symbol and Exchange cannot be empty");
    }
  };

  useEffect(() => {
    return () => {};
  }, []);

  return (
    <div className="d-flex flex-column flex-lg-row gap-2 gap-lg-3 align-items-stretch align-items-lg-center">
      <div className="d-flex flex-column flex-sm-row gap-2 align-items-stretch">
        <InputGroup className="w-100">
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
          <SymbolSelector searchList={searchList} setSymbol={setSymbol} setSelectedStock={setSelectedStock} />
          <Form.Control
            placeholder="Add Symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") searchSymbol();
            }}
            className="flex-grow-1"
            style={{ minHeight: 40, fontSize: 15, minWidth: 60 }}
          />
          <Button
            variant="outline-secondary"
            onClick={searchSymbol}
            className="d-flex align-items-center justify-content-center"
          >
            <IoSearch style={{ padding: 0, margin: 0 }} />
          </Button>
        </InputGroup>
      </div>
      <Button variant="primary" className="w-100" onClick={addSymbol}>
        Add Symbol
      </Button>
    </div>
  );
};
const SymbolSelector = (props: {
  searchList: searchSymbolResponseData_i[];
  setSelectedStock: React.Dispatch<React.SetStateAction<searchSymbolResponseData_i | undefined>>;
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
