import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.min.css";
import { ThemeProvider } from "@material-tailwind/react";
import { I18nextProvider } from "react-i18next"; // Import I18nextProvider
import i18n from "./i18n"; // Import the i18n config
import { LoadScript } from "@react-google-maps/api";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <LoadScript
          googleMapsApiKey="AIzaSyDF6jdqejKKA-fju5cARgs1fsXM9NYo2QY"
          libraries={["places"]}
        >
          <App />
        </LoadScript>
      </ThemeProvider>
    </I18nextProvider>
  </React.StrictMode>
);

reportWebVitals();
