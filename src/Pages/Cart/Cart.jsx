import React, { useContext } from 'react';
import LayOut from '../../Components/LayOut/LayOut';
import { DataContext} from '../../Components/DataProvider/DataProvider' ;
import CurrencyFormat from '../../Components/Product/CurrencyFormat';
import { Link } from 'react-router-dom';
import classes from './Cart.module.css';
import ProductCard from '../../Components/Product/ProductCard'
function Cart() {
    const [{ basket, user }, dispatch] = useContext(DataContext);
    const total = basket.reduce(
  (amount, item) => item.price * item.quantity + amount,
  0
);

    console.log(user)
     return (
        <Layout>
            <section className={classes.container}>
                <div className={classes.cart__container}>
                    <h2>Hello {user?.email}</h2>
                    <h3>Your shopping basket</h3>
                    <hr />
                    {
                        basket?.length === 0 ? (
                            <p>Oops! No item in your basket</p>
                        ) : (
                            basket?.map((item, i) => {
                                return <ProductCard
                                     key={item.id}
                                    product={item}
                                
                                    renderAdd={false}
                      
                                />
                            })
                        )
                    }
                </div>
                {
                    basket?.length !== 0 && (
                        <div className={classes.subtotal}>
                            <div>
                                <p>Subtotal ({basket?.length} items)</p>
                                <CurrencyFormat amount={total} />
                            </div>
                            <span>
                                <input type="checkbox" />
                                <small>This order contains a gift</small>
                 </span>
                  <Link to="/payments" className={classes.checkout_button}>
                 Continue to Checkout
                 </Link>
                        </div>
                    )
                }
            </section>
        </Layout>
    );
}

export default Cart;