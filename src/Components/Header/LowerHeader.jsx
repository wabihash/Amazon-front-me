import React from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineMenu } from "react-icons/ai";
import classes from './Header.module.css'

function LowerHeader() {
  return (
    <div className={classes.lower__container}>
      <ul>
        <li>
          <AiOutlineMenu className={classes.menu__icon} />
          <p>All</p>
        </li>
        <li><Link to="/category/electronics">Electronics</Link></li>
        <li><Link to="/category/jewelery">Jewelry</Link></li>
        <li><Link to="/category/men's%20clothing">Men's Fashion</Link></li>
        <li><Link to="/category/women's%20clothing">Women's Fashion</Link></li>
        <li>Today's Deals</li>
        <li>Customer Service</li>
        <li>Registry</li>
        <li>Gift Cards</li>
        <li>Sell</li>
      </ul>
    </div>
  );
}

export default LowerHeader;