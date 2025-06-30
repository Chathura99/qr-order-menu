import React from "react";
import "./BurgerSpinner.css"; // Add CSS for styling

const BurgerSpinner = () => {
  return (
    <div className="burger-spinner">
      <div className="burger">
        <div className="bun top"></div>
        <div className="patty"></div>
        <div className="bun bottom"></div>
      </div>
      <p className="loading-text">Cooking ...</p>
    </div>
  );
};

export default BurgerSpinner;