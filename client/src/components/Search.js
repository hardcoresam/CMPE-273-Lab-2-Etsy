import React, { Fragment, useState, useEffect } from 'react';
import { Button, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import ProductList from './ProductList';
import { useSearchParams, useLocation } from 'react-router-dom';
import { backendServer } from './util';

export default function Search(props) {
    const [searchedText, setSearchedText] = useState();
    const [searchForm, setSearchForm] = useState({ minPrice: '', maxPrice: '' });
    const [excludeOutOfStock, setExcludeOutOfStock] = useState(false);
    const [sortBy, setSortBy] = useState('price');
    const [priceFilterClicked, setPriceFilterClicked] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [productsGrid, setProductsGrid] = useState([]);
    const location = useLocation();

    useEffect(async () => {
        setSearchedText(searchParams.get('text').replace(/%20/g, " "));
        axios.defaults.withCredentials = true;
        const { data: products } = await axios.post(backendServer + '/products/filtered', {
            sortBy: sortBy,
            excludeOutOfStock: excludeOutOfStock,
            minPrice: searchForm.minPrice,
            maxPrice: searchForm.maxPrice,
            searchedText: searchParams.get('text').replace(/%20/g, " ")
        });
        let gridOfProducts = [];
        for (let i = 0; i < products.length; i = i + 4) {
            gridOfProducts.push(products.slice(i, i + 4));
        }
        setProductsGrid(gridOfProducts);
    }, [location, priceFilterClicked, excludeOutOfStock, sortBy]);

    const handleFormDataChange = (event) => {
        setSearchForm({ ...searchForm, [event.target.name]: event.target.value });
    }

    return (
        <Fragment>
            <h4 style={{ textAlign: 'center' }}>You searched Etsy for "{searchedText}"</h4>
            <h5 style={{ textAlign: 'center', fontWeight: "lighter" }}>Feel free to use our filters below.</h5>
            <hr />
            <Row>
                <Col sm={5}>
                    <Row xs="auto">
                        <Col>
                            <span>Min Price: </span>
                        </Col>
                        <Col>
                            <input type="number" style={{ width: "70px" }} name="minPrice" onChange={(e) => handleFormDataChange(e)} />
                        </Col>
                        <Col>
                            <span>Max Price: </span>
                        </Col>
                        <Col>
                            <input type="number" style={{ width: "70px" }} name="maxPrice" onChange={(e) => handleFormDataChange(e)} />
                        </Col>
                        <Col>
                            <Button variant="dark" className="rounded-pill" onClick={(e) => setPriceFilterClicked(!priceFilterClicked)}>Apply</Button>
                        </Col>
                    </Row>
                </Col>
                <Col sm={2}></Col>
                <Col sm={2}>
                    <Form.Check type="checkbox" name="excludeOutOfStock" label="Remove out of stock items" onClick={(e) => setExcludeOutOfStock(e.target.checked)} />
                </Col>
                <Col sm={3}>
                    <div style={{ marginRight: "4%" }}>
                        <Form.Select name="sortBy" onChange={(e) => setSortBy(e.target.value)}>
                            <option value="price">Sort by: Lowest Price</option>
                            <option value="-price">Sort by: Highest Price</option>
                            <option value="quantity_available">Sort by: Lowest Quantity</option>
                            <option value="-quantity_available">Sort by: Highest Quantity</option>
                            <option value="no_of_sales">Sort by: Lowest Sales Count</option>
                            <option value="-no_of_sales">Sort by: Highest Sales Count</option>
                        </Form.Select>
                    </div>
                </Col>
            </Row>
            <hr />

            <ProductList productsGrid={productsGrid} showEditButton={false} />
        </Fragment >
    );
}