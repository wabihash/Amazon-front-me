import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineLocationMarker } from 'react-icons/hi';
import { FaShoppingCart } from 'react-icons/fa';
import { FaSearch } from 'react-icons/fa';
import classes from './Header.module.css';
import LowerHeader from './LowerHeader';
import { DataContext } from '../DataProvider/DataProvider';
import {auth} from '../../Utility/Firebase'
function Header() {
  const [{ basket,user }] = useContext(DataContext);

  // ✅ total items = sum of quantities
  const totalItems = basket.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  return (
    <section className={classes.stickyWrapper}>
      <div className={classes.header_container}>
        {/* LEFT */}
        <div className={classes.logo_container}>
          <Link to="/">
            <img src="/amazon_PNG11.png" alt="Amazon Logo" />
          </Link>

          <div className={classes.delivery}>
            <span>
              <HiOutlineLocationMarker />
            </span>
            <div>
              <p>Delivered to</p>
              <strong>Ethiopia</strong>
            </div>
          </div>
        </div>

        {/* SEARCH */}
        <div className={classes.search}>
          <select>
            <option value="all">All</option>
          </select>
          <input type="text" placeholder="Search Amazon" />
          <FaSearch className={classes.searchIcon} />
        </div>

        {/* RIGHT */}
        <div className={classes.order_container}>
          <div className={classes.language}>
            <img
              src="https://tse1.mm.bing.net/th/id/OIP.o6qGMJjK3eeBHQYMGaV3pQHaEC"
              alt="Language"
            />
            <select>
              <option value="en">En</option>
              <option value="oro">ORO</option>
              <option value="fr">Amh</option>
            </select>
          </div>

          <Link to={!user && "/auth"}>
            <div>
              {
                user ? ( 
                  <>
                    <p>Hello,{user?.email?.split("@")[0]}</p>
                    <span onClick={()=>auth.signOut()}>Sign Out</span>
                  </>
                
                ) : (
                    <>
                    <p>Hello,Sign In</p>
                    <span>Account & Lists</span>
                    </>
                    
                )
             }
            </div>
           
          </Link>

          <Link to="/orders" className={classes.account}>
            <p>Returns</p>
            <span>& Orders</span>
          </Link>

          {/* CART */}
          <Link to="/cart" className={classes.cart}>
            <FaShoppingCart size={20} />
            <span>{totalItems}</span>
          </Link>
        </div>
      </div>

      <LowerHeader />
    </section>
  );
}

export default Header;
