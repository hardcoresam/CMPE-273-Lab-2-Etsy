import React, { Fragment, useState, useEffect } from 'react';
import { Button, Form, Row, Col, Image } from 'react-bootstrap';
import defaultShopImage from './../images/default_shop_image.png';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getCurrencySymbol, backendServer } from './util';
import { toast } from 'react-toastify';

export default function ProductDetail(props) {

    const params = useParams();
    const [productId, setProductId] = useState(params.productId);
    const [productData, setProductData] = useState();
    const [isFavourited, setIsFavourited] = useState();
    const [quantity, setQuantity] = useState(1);
    const [currencySymbol, setCurrencySymbol] = useState('$');
    const navigate = useNavigate();

    useEffect(async () => {
        axios.defaults.withCredentials = true;
        const { data: productData } = await axios.get(backendServer + `/product/${productId}`);
        setProductData(productData);
        setIsFavourited(productData.is_favourited);
        const userCurrency = window.localStorage.getItem("user_currency");
        if (userCurrency) {
            setCurrencySymbol(getCurrencySymbol(userCurrency));
        }
    }, []);

    const addToCart = async (event) => {
        axios.defaults.withCredentials = true;
        const response = await axios.post(backendServer + '/cart/add', { productId: productId, quantity: quantity });
        if (response.status === 200) {
            toast.success('Added to cart successfully!', { position: "top-center" });
            navigate('/cart');
        } else {
            toast.error('Failed to add to cart. Please try later!', { position: "top-center" });
        }
    }

    const modifyFavourites = async (event) => {
        axios.defaults.withCredentials = true;
        const response = await axios.post(backendServer + '/favourite', { productId: productId });
        if (response.status === 200) {
            toast.success('Modified favourites successfully!', { position: "top-center" });
            setIsFavourited(!isFavourited);
        } else {
            toast.error('Failed to modify favourites. Please try later!', { position: "top-center" });
        }
    }

    return (
        <Fragment>
            {productData && (
                <Row style={{ marginLeft: "7%", marginRight: "7%", marginTop: 20, marginBottom: 20 }}>
                    <Col sm={6}>
                        <Image thumbnail className="d-block w-100" width={200} height={300} src={productData.photo ? productData.photo : defaultShopImage} />
                    </Col>
                    <Col sm={6}>
                        <Row>
                            <Link to={'/shop/' + productData.Shop.id}>{productData.Shop.name}</Link>
                            <h6 style={{ fontWeight: "lighter" }}>{productData.shop_total_sales ? productData.shop_total_sales : 0} sales</h6>
                        </Row>
                        <Row><h3>{productData.name}</h3></Row>
                        <Row><h4>{currencySymbol}{productData.price}</h4></Row>
                        <Row><h6>{productData.quantity_available > 0 ? (<span>{productData.quantity_available} available</span>) : (<span style={{ color: 'red' }}>Out of Stock</span>)}</h6></Row>
                        <Row>
                            <Form.Group className="mb-3">
                                <Form.Label>Select quantity</Form.Label>
                                <Form.Select name="quantity" onChange={(e) => setQuantity(e.target.value)}>
                                    {[...Array(productData.quantity_available + 1).keys()].slice(1).map((number) => (
                                        <option value={number} key={number}>{number}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Row>
                        <br />
                        <Row>
                            <div className="mb-3">
                                <Button variant='dark' className='rounded-pill' onClick={(e) => modifyFavourites(e)} style={{ width: "100%" }}>{isFavourited ? (<span>Remove from favourites</span>) : (<span>Add to favourites</span>)}</Button>
                            </div>
                        </Row>
                        <Row>
                            <div className="mb-3">
                                <Button variant='dark' className='rounded-pill' onClick={(e) => addToCart(e)} disabled={productData.quantity_available === 0} style={{ width: "100%" }}>Add to cart</Button>
                            </div>
                        </Row>
                        <br />
                        <Row>
                            <h6 style={{ fontWeight: "lighter" }}>Description: {productData.description ? (<span>{productData.description}</span>) : (<span>This product doesn't have any description</span>)}</h6>
                        </Row>
                    </Col>
                </Row>
            )}
        </Fragment>
    );
}