import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";
import classes from "./Product.module.css";
import Loader from "../Loader/Loader"; 

const Product = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get("https://fakestoreapi.com/products")
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
    
        <Loader />
      
    );
  }

  return (
    
      <section className={classes.products_container}>
        {products.map((product) => (
          <ProductCard  renderAdd={true} product={product} key={product.id} />
        ))}
      </section>
   
  );
};

export default Product;
