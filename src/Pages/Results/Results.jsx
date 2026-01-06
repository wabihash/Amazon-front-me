import React, { useEffect, useState } from 'react'
import classes from './Results.module.css'
import Layout from '../../Components/LayOut/LayOut'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { productUrl } from '../../API/Endpoint'
import ProductCard from '../../Components/Product/ProductCard'
import Loader from '../../Components/Loader/Loader'

function Results() {
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(true)
    const { categoryName } = useParams()

    useEffect(() => {
        setLoading(true)
        axios.get(`${productUrl}/products/category/${categoryName}`)
            .then((res) => {
                setResults(res.data)
                setLoading(false)
            })
            .catch((err) => {
                console.log(err)
                setLoading(false)
            })
    }, [categoryName])

    if (loading) {
        return (
            <Layout>
                <Loader />
            </Layout>
        )
    }

    return (
        <Layout>
            <section className={classes.results_section}>
                <h1 className={classes.results_title}>Results</h1>
                <p className={classes.results_category}>Category / {categoryName}</p>
                <hr />
                <div className={classes.products_container}>
                    {results.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                             renderAdd={true}
                        />
                    ))}
                </div>
            </section>
        </Layout>
    )
}

export default Results
