import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Form from "react-bootstrap/esm/Form";
import InputGroup from "react-bootstrap/esm/InputGroup";
import { IoSearch } from "react-icons/io5";
import store from "../../../redux";
import eventBus from "../../../util/eventBus";
import { getStockKeyId } from "../../../../../backend/src/util/helper";
import * as styles from "./index.module.scss";
import { ORDER_exchange } from "../../../../../backend/src/crud/order/order_constants";

export const AddSymbol = () => {
  const [symbol, setSymbol] = useState<string>("");
  const [symbolExchange, setSymbolExchange] = useState<ORDER_exchange>(ORDER_exchange.BSE);
  const [searchList, setSearchList] = useState<OPENALGO.search.searchSymbolData_t[]>([]);
  const [selectedStock, setSelectedStock] = useState<OPENALGO.search.searchSymbolData_t>();

  const searchSymbol = async () => {
    if (symbol) {
      console.log("Searching Symbol: ", symbol, " on ", symbolExchange);
      eventBus.emitEvent({
        type: "OPENALGO",
        action: {
          type: "SEARCH_SYMBOL",
          data: { symbol: symbol, exchange: symbolExchange, userId: store.getState().user?.user?.id ?? "" },
        },
      });
    } else {
      console.log("Search Symbol cannot be empty");
    }
  };

  const addSymbol = async () => {
    if (selectedStock && symbolExchange) {
      eventBus.emitEvent({
        type: "CRUD",
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
    eventBus.setEventListener("ADD_SYMBOL_COMP_OPENALGO_LISTENER", "OPENALGO", async (props) => {
      switch (props.type) {
        case "SEARCH_SYMBOL_RESULTS":
          setSearchList(props.data.symbols);
          break;

        default:
          break;
      }
    });
    return () => {
      eventBus.removeEventListener("ADD_SYMBOL_COMP_OPENALGO_LISTENER", "OPENALGO");
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      <div>
        <InputGroup>
          <DropdownButton variant="outline-secondary" title={symbolExchange} align="end">
            <Dropdown.Item
              onClick={() => {
                setSymbolExchange(ORDER_exchange.NSE);
              }}
            >
              NSE
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => {
                setSymbolExchange(ORDER_exchange.BSE);
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
            className={styles.symbolInput}
          />
          <Button
            variant="outline-secondary"
            onClick={searchSymbol}
            className={`d-flex align-items-center justify-content-center ${styles.searchButton}`}
          >
            <IoSearch style={{ padding: 0, margin: 0 }} />
          </Button>
        </InputGroup>
      </div>
      <div>
        <Button variant="primary" className="w-100" onClick={addSymbol}>
          Add Symbol
        </Button>
      </div>
    </div>
  );
};
const SymbolSelector = (props: {
  searchList: OPENALGO.search.searchSymbolData_t[];
  setSelectedStock: React.Dispatch<React.SetStateAction<OPENALGO.search.searchSymbolData_t | undefined>>;
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
        align="end"
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
