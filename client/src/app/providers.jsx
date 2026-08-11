// src/app/providers.jsx

import { Provider } from "react-redux";
import {
  CssBaseline,
  ThemeProvider,
} from "@mui/material";

import { store } from "./store";
import theme from "../theme/theme";

const AppProviders = ({ children }) => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        {children}
      </ThemeProvider>
    </Provider>
  );
};

export default AppProviders;