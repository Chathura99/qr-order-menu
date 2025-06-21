import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/dashboard/Dashboard";

import NotFound from "./components/NotFound";
import ComingSoon from "./pages/comingSoon/ComingSoon";
import Profile from "./pages/auth/Profile";
import Login from "./pages/auth/Login";
import Driver from "./pages/driver/Driver";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/drivers" element={<Driver/>} />
        <Route
          path="/conductors"
          element={<ComingSoon featureName="Conductor" />}
        />
        <Route path="/reports" element={<ComingSoon featureName="Report" />} />
        <Route
          path="/daily-route"
          element={<ComingSoon featureName="Daily Routes" />}
        />
        <Route
          path="/payments"
          element={<ComingSoon featureName="Payment" />}
        />
        <Route
          path="/co-monitor"
          element={<ComingSoon featureName="Conductor Monitor" />}
        />
        <Route
          path="/dr-monitor"
          element={<ComingSoon featureName="Driver Monitor" />}
        />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
