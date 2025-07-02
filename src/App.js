import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/dashboard/Dashboard";

import NotFound from "./components/NotFound";
import ComingSoon from "./pages/comingSoon/ComingSoon";
import Profile from "./pages/auth/Profile";
import Login from "./pages/auth/Login";
import PendingOrders from "./pages/orders/PendingOrders";
import InprogressOrders from "./pages/orders/InprogressOrders";
import CompletedOrders from "./pages/orders/CompletedOrders";
import QRCodePage from "./pages/qrcodepage/QRCodePage";
import QrTable from "./pages/qr_table/QrTable";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/p-orders" element={<PendingOrders />} />
        <Route path="/i-orders" element={<InprogressOrders />} />
        <Route path="/c-orders" element={<CompletedOrders />} />
        <Route path="/qr-tables" element={<QrTable />} />
        <Route path="/qr/:qr_prefix" element={<QRCodePage />} />

        <Route path="/reports" element={<ComingSoon featureName="REPORTS" />} />

        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
