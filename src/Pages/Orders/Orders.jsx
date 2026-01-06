import React, { useContext, useState, useEffect } from "react";
import LayOut from "../../Components/LayOut/LayOut";
import classes from "./Orders.module.css";
import { db } from "../../Utility/Firebase.jsx";
import { DataContext } from '../../Components/DataProvider/DataProvider';
import ProductCard from "../../Components/Product/ProductCard.jsx";
function Orders() {
    const [{ user }, dispatch] = useContext(DataContext);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        if (user) {
            db.collection("users")
                .doc(user.uid)
                .collection("orders")
                .orderBy("created", "desc")
                .onSnapshot((snapshot) => {
                    console.log("Snapshot received:", snapshot);
                    setOrders(
                        snapshot.docs.map((doc) => ({
                            id: doc.id,
                            data: doc.data(),
                        }))
                    );
                });
        } else {
            setOrders([]);
        }
    }, [user]);
    return (
        <LayOut>
            <section className={classes.container}>
                <div className={classes.orders__container}>
            <h2>Your Orders</h2>
            {orders?.length === 0 && (
                <h3 style={{
                  padding : "20px"
                      
                    }}>No orders found</h3>
            )
            }
             <div>
                   {orders?.map((eachOrder) => {
                            return (
                                <div key={eachOrder.id}>
                                    <hr />
                                    <p>Order ID: {eachOrder?.id}</p>
                                    {eachOrder?.data?.basket?.map((order) => (
                                        <ProductCard  product={order} key={order.id} isOrder={true} />
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </LayOut>
    );
}

export default Orders;