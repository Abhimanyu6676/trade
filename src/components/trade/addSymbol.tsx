import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Form from "react-bootstrap/esm/Form";
import InputGroup from "react-bootstrap/esm/InputGroup";
import { IoSearch } from "react-icons/io5";
import store from "../../redux";
import { stocksSagaAction } from "../../redux/saga/stocksSaga";
import openAlgoClient from "../../api";
import { getStockKeyId } from "../../util/helper";

export const AddSymbol = () => {
  const [symbol, setSymbol] = useState<string>("");
  const [selectedStock, setSelectedStock] = useState<StockListSearchResult_i>();
  const [symbolExchange, setSymbolExchange] = useState<"NSE" | "BSE">("BSE");
  const [symbolsList, setSymbolsList] = useState<StockListSearchResult_i[]>([]);

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
            symbolsList={symbolsList}
            setSelectedStock={setSelectedStock}
          />
          <Form.Control
            placeholder="Add Symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            style={{ width: 200, height: 40, fontSize: 15 }}
          />
          <Button
            variant="outline-secondary"
            id="button-addon2"
            onClick={async () => {
              if (symbol) {
                console.log(
                  "Searching Symbol: ",
                  symbol,
                  " on ",
                  symbolExchange,
                );
                const searchResult = await openAlgoClient.getClient().search({
                  query: symbol,
                  exchange: symbolExchange,
                });
                console.log(
                  "Search Result = ",
                  JSON.stringify(searchResult.data),
                );
                if (searchResult?.status == "success" && searchResult?.data) {
                  console.log("Setting Search Selector List as per results");
                  setSymbolsList(searchResult.data);
                } else {
                  console.log("Search result error");
                }
                //TODO search symbol from selected exchange via api and update symbolsList
              } else {
                console.log("Search Symbol cannot be empty");
              }
            }}
          >
            <IoSearch style={{ padding: 0, margin: 0 }} />
          </Button>
        </InputGroup>
      </div>
      <div style={{ marginLeft: 30 }}>
        <Button
          variant="primary"
          onClick={() => {
            //TODO add symbol to redux and add to localStorage from saga
            if (selectedStock && symbolExchange) {
              store.dispatch(
                stocksSagaAction({
                  addStocks: [
                    {
                      key_id: getStockKeyId(selectedStock),
                      name: selectedStock.name,
                      brSymbol: selectedStock.brsymbol,
                      symbol: selectedStock.symbol,
                      exchange: symbolExchange,
                    },
                  ],
                }),
              );
              setSymbol("");
              setSelectedStock(undefined);
              setSymbolsList([]);
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
  symbolsList: StockListSearchResult_i[];
  setSelectedStock: React.Dispatch<
    React.SetStateAction<StockListSearchResult_i | undefined>
  >;
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    //console.log("SymbolSelector Effect ran");
    if (props.symbolsList?.length) {
      setShowDropdown(true);
    }

    return () => {};
  }, [props.symbolsList]);

  return (
    <>
      <DropdownButton
        variant="outline-secondary"
        id="input-group-dropdown-2"
        title={""}
        disabled={props.symbolsList?.length === 0}
        show={showDropdown}
        onToggle={() => {
          setShowDropdown(!showDropdown);
        }}
      >
        {props.symbolsList?.map((symbol, index) => (
          <Dropdown.Item
            key={index}
            onClick={() => {
              props.setSelectedStock(symbol);
              setShowDropdown(false);
            }}
          >
            {symbol.symbol}
          </Dropdown.Item>
        ))}
      </DropdownButton>
    </>
  );
};
