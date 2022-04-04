import React, { Fragment, useState, useEffect } from 'react';
import { Button, Form, Row, Col, Image, Card } from 'react-bootstrap';
import defaultShopImage from './../images/default_shop_image.png';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { getCurrencySymbol, backendServer } from './util';
import { toast } from 'react-toastify';

export default function Cart(props) {

    const [cartData, setCartData] = useState();
    const [currencySymbol, setCurrencySymbol] = useState('$');
    const navigate = useNavigate();

    useEffect(async () => {
        axios.defaults.withCredentials = true;
        const { data: cartData } = await axios.get(backendServer + '/cart');
        setCartData(cartData);
        const userCurrency = window.localStorage.getItem("user_currency");
        if (userCurrency) {
            setCurrencySymbol(getCurrencySymbol(userCurrency));
        }
    }, []);

    const removeFromCart = async (product) => {
        axios.defaults.withCredentials = true;
        const response = await axios.post(backendServer + '/cart/remove', { productId: product.id }, {
            validateStatus: status => status < 500
        });
        if (response.status === 200) {
            toast.success('Removed from cart successfully!', { position: "top-center" });
            setCartData(response.data);
        } else {
            toast.error('Failed to remove from cart. Please try later!', { position: "top-center" });
        }
    }

    const calculateTotal = () => {
        let total = 0;
        cartData.Products.map((product) => {
            total = total + (product.price * product.CartProduct.quantity);
        })
        return total;
    }

    const orderProducts = async (e) => {
        axios.defaults.withCredentials = true;
        const response = await axios.post(backendServer + '/order', {}, {
            validateStatus: status => status < 500
        });
        if (response.status === 200) {
            toast.success('Order placed successfully!', { position: "top-center" });
            navigate("/orders");
        } else if (response.status === 401) {
            toast.error(response.data.error, { position: "top-center" });
        } else {
            toast.error('Failed to place order. Please try later!', { position: "top-center" });
        }
    }

    return (
        <Fragment>
            {(!cartData || cartData.Products.length === 0) && (
                <div style={{ marginLeft: "15%", marginRight: "15%", marginTop: "10%", textAlign: 'center' }}>
                    <h2>Your cart is empty.</h2>
                    <h4 style={{ fontWeight: "lighter" }}><a href="/home">Discover something unique to fill it up.</a></h4>
                </div>
            )}
            {cartData && cartData.Products.length > 0 && (
                <>
                    <h2 style={{ marginTop: "1%", textAlign: 'center' }}>{cartData.Products.length} item(s) in your cart</h2>
                    <Row style={{ marginLeft: "2%", marginRight: "2%", marginTop: 15 }}>
                        <Col sm={9}>
                            <Card>
                                {cartData.Products.map((product) => (
                                    <Card.Body>
                                        <Row>
                                            <Col sm={3}>
                                                <Image rounded width={200} height={200} src={product.photo ? product.photo : defaultShopImage} />
                                            </Col>
                                            <Col sm={9}>
                                                <Row><h3>Name: {product.name}</h3></Row>
                                                <Row><h6>Shop : <Link to={'/shop/' + product.Shop.id}>{product.Shop.name}</Link></h6></Row>
                                                <Row><h5>Price per unit: {currencySymbol}{product.price}</h5></Row>
                                                <Row><h5>Quantity: {product.CartProduct.quantity}</h5></Row>
                                                <Row><h5>Total: {currencySymbol}{product.price} * {product.CartProduct.quantity} = {currencySymbol}{product.price * product.CartProduct.quantity}</h5></Row>
                                                <Row>
                                                    <Button variant='warning' className='rounded-pill' onClick={(e) => removeFromCart(product)} style={{ width: "auto" }}>Remove from cart</Button>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                ))}
                            </Card>
                        </Col>
                        <Col sm={3}>
                            <Card>
                                <Card.Body>
                                    <Row><h4 style={{ textAlign: 'center' }}>Total Price Details</h4></Row>
                                    <hr />
                                    <Row>
                                        <Col><h6>Item(s) Total:</h6></Col>
                                        <Col><h5>{currencySymbol}{calculateTotal()}</h5></Col>
                                    </Row>
                                    <Row>
                                        <Col><h6>Delivery:</h6></Col>
                                        <Col><h5>{currencySymbol}0.00</h5></Col>
                                    </Row>
                                    <br />
                                    <Row>
                                        <Col><h4>Total:</h4></Col>
                                        <Col><h4>{currencySymbol}{calculateTotal()}</h4></Col>
                                    </Row>
                                    <br />
                                    <Row>
                                        <Button variant='success' onClick={(e) => { orderProducts(e) }} className='rounded-pill'>Place Order</Button>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </>
            )}
        </Fragment>
    );
}