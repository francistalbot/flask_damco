import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux"; // Import Provider from react-redux
import { store } from "./redux/store"; // Import the store

const App = () => {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
    </Router>

  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
    <Provider store={store}>
        <App />
    </Provider>
);

