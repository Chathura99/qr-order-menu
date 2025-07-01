import React from "react";
import "./BurgerSpinner.css"; // Add CSS for styling

const BurgerSpinner = () => {
  return (
<div className="burger-spinner">
  <div className="floating-items">
    <div className="item">🍔</div>
    <div className="item">🍕</div>
    <div className="item">🥤</div>
    <div className="item">📱</div> {/* Represents QR Code or mobile */}
  </div>
  <div className="loading-text">Loading, please wait...</div>
</div>

  );
};

export default BurgerSpinner;