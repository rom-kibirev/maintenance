import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import {CookiesProvider} from "react-cookie";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <BrowserRouter future={{v7_startTransition: true}}>
            <CookiesProvider>
                <App />
            </CookiesProvider>
        </BrowserRouter>
    </React.StrictMode>,
);
