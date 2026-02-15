import { createContext, useContext } from "react";

interface CurrencyContextType {
  displayInThousands: boolean;
  formatCurrency: (value: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  displayInThousands: false,
  formatCurrency: (value: number) => value.toLocaleString("it-IT"),
});

export const useCurrency = () => useContext(CurrencyContext);

export default CurrencyContext;
