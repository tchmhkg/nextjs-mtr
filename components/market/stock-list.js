import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import styled from "styled-components";
import RefreshIcon from '@material-ui/icons/Refresh';
import { IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import StockItem from "~/components/market/item";
import SearchInput from '~/components/market/input';

import { useTheme } from "~/theme";
import useTranslation from "~/hooks/useTranslation";

const EmptyContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const EmptyDataText = styled.span`
  font-size: 24px;
  color: ${props => props.theme.text};
`;

const HeaderWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

// const DelayReminder = styled.span`
//   font-size: 14px;
// `;

const iconStyles = colors => {
  return {
    icon: {
      color: colors.text,
    },
  };
}

const RefreshButton = ({onClick = () => {}}) => {
  const {colors} = useTheme();
  const classes = makeStyles(iconStyles(colors))();
    return (
      <IconButton className={classes.icon} onClick={onClick}>
        <RefreshIcon />
      </IconButton>
    )
}

const StockList = () => {
  const { locale, t } = useTranslation();

  const [stocks, setStocks] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  let isCancelled = useRef(false);
  const [symbol, setSymbol] = useState("");

  const onChangeSymbol = (e) => {
    setSymbol(e.target.value?.toUpperCase());
  }

  const resetSymbol = () => {
    setSymbol('');
  }

  useEffect(() => {
    const getFromStorage = async() => {
      try {
        let data = await window.localStorage.getItem('symbols');
        let jsonData = [];
        if(data !== null) {
          jsonData = JSON.parse(data);
          if (jsonData?.length) {
            setStocks(jsonData);
            const symbolsString = jsonData.map(({ symbol }) => symbol).join(",");
            getQuotes(symbolsString);
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
    getFromStorage();
  }, []);



  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const data = await window.localStorage.getItem('symbols');
        if (data !== null) {
          // console.log(JSON.parse(data));
          const jsonData = JSON.parse(data);
          if (jsonData?.length) {
            const symbolsString = jsonData.map(({symbol}) => symbol).join(',');
            getQuotes(symbolsString);
          } else {
            setIsRefreshing(false);
          }
          // setStocks(JSON.parse(data));
        }
      } catch (e) {
        console.log(e);
        setIsRefreshing(false);
      }
    };
    if (isRefreshing) {
      fetchStocks();
    }
  }, [isRefreshing])

  const getQuotes = (symbols) => {
    axios
      .get('/api/market/quotes', {
        params: {
          symbol: symbols
        }
      })
      .then((res) => {
        if (res?.data && !isCancelled.current) {
          console.log(res.data);
          setStocks(res?.data?.data);
          // setStocks(Object.values(res?.data));
          // console.log(Object.values(res?.data));
        }
        setIsRefreshing(false);
      })
      .catch(function (thrown) {
        if (axios.isCancel(thrown)) {
          console.log("Request canceled", thrown.message);
        } else {
          console.log(thrown);
        }
        setIsRefreshing(false);
      });
  };

  const onClickRefresh = useCallback(() => {
    setIsRefreshing(true);
  }, []);

  return (
    <div>
      <SearchInput 
        value={symbol}
        onChange={onChangeSymbol}
        onSearchClear={resetSymbol}
      />
      {stocks && stocks.length ? (
      <>
        <HeaderWrapper>
          <span>{t('Saved Stock List')}</span>
          <RefreshButton onClick={onClickRefresh} />
          {/* <DelayReminder>{t('Delay +20 min.')}</DelayReminder> */}
        </HeaderWrapper>
        {stocks?.map((stock) => (
          <StockItem key={stock.symbol} item={stock} refreshing={isRefreshing} setIsRefreshing={setIsRefreshing}/>
        ))}
      </>
      ) : (
        <EmptyContainer>
          <EmptyDataText>{t('It\'s empty here.')}</EmptyDataText>
        </EmptyContainer>
      )}
    </div>
  );
};

export default StockList;
