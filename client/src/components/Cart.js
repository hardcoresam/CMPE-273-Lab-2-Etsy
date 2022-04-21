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
    const [productsNoteToSeller, setProductsNoteToSeller] = useState({});

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
        cartData.cart.map((productInfo) => {
            total = total + (productInfo.product.price * productInfo.quantity);
        })
        return total;
    }

    const setNoteToSeller = (noteToSeller, product) => {
        setProductsNoteToSeller(prevState => {
            let destructuredPrevState = { ...prevState };
            destructuredPrevState[product.id] = noteToSeller;
            return destructuredPrevState;
        });
    }

    const addNoteToSeller = (event, product) => {
        event.preventDefault();
        let noteToSeller = productsNoteToSeller[product.id];
        if (!noteToSeller) {
            return;
        }
        modifyCart('note_to_seller', noteToSeller, product);
    }

    const modifyCart = async (modifiedType, modifiedValue, product) => {
        axios.defaults.withCredentials = true;
        const response = await axios.post(backendServer + '/cart/modify', { productId: product.id, updateType: modifiedType, updateValue: modifiedValue });
        setCartData(response.data);
    }

    const orderProducts = async (e) => {
        axios.defaults.withCredentials = true;
        const response = await axios.post(backendServer + '/order', {}, {
            validateStatus: status => status < 500
        });
        if (response.status === 200) {
            toast.success('Order placed successfully!', { position: "top-center" });
            navigate("/orders");
        } else {
            toast.error(response.data.error, { position: "top-center" });
        }
    }

    const handleProductClick = (id) => {
        navigate(`/product/${id}`);
    }

    return (
        <Fragment>
            {(!cartData || cartData.cart.length === 0) && (
                <div style={{ marginLeft: "15%", marginRight: "15%", marginTop: "10%", textAlign: 'center' }}>
                    <h2>Your cart is empty.</h2>
                    <h4 style={{ fontWeight: "lighter" }}><a href="/home">Discover something unique to fill it up.</a></h4>
                </div>
            )}
            {cartData && cartData.cart.length > 0 && (
                <>
                    <h2 style={{ marginTop: "1%", textAlign: 'center' }}>{cartData.cart.length} item(s) in your cart</h2>
                    <Row style={{ marginLeft: "2%", marginRight: "2%", marginTop: 15 }}>
                        <Col sm={9}>
                            <Card>
                                {cartData.cart.map((productInfo) => (
                                    <Card.Body>
                                        <Row>
                                            <Col sm={3}>
                                                <Image onClick={() => handleProductClick(productInfo.product.id)} rounded width={200} height={200} src={productInfo.product.photo ? productInfo.product.photo : defaultShopImage} />
                                            </Col>
                                            <Col sm={9}>
                                                <Row><h3>Name: {productInfo.product.name}</h3></Row>
                                                <Row><h6>Shop : <Link to={'/shop/' + productInfo.product.shop.id}>{productInfo.product.shop.name}</Link></h6></Row>
                                                <Row><h5>Price per unit: {currencySymbol}{productInfo.product.price}</h5></Row>
                                                <Row><h5>
                                                    Quantity:
                                                    <Form.Select name="quantity" value={productInfo.quantity} onChange={(e) => modifyCart('quantity', e.target.value, productInfo.product)}>
                                                        {[...Array(productInfo.product.quantity_available + 1).keys()].slice(1).map((number) => (
                                                            <option value={number} key={number}>{number}</option>
                                                        ))}
                                                    </Form.Select>
                                                </h5></Row>
                                                <Row><h5><Form.Check type="checkbox" checked={productInfo.gift_packing} name="giftPacking" label="This order is a gift" onClick={(e) => modifyCart('gift_packing', e.target.checked, productInfo.product)} /></h5></Row>

                                                <Row><h5>
                                                    <Form className="d-flex" onSubmit={(e) => addNoteToSeller(e, productInfo.product)}>
                                                        <Form.Control type="text" name="noteToSeller" defaultValue={productInfo.note_to_seller} onChange={(e) => setNoteToSeller(e.target.value, productInfo.product)} placeholder="Add a note to seller" className="me-2" />
                                                        <Button variant="outline-success" type="submit">Save</Button>
                                                    </Form>
                                                </h5></Row>

                                                <Row><h5>Total: {currencySymbol}{productInfo.product.price} * {productInfo.quantity} = {currencySymbol}{productInfo.product.price * productInfo.quantity}</h5></Row>
                                                <Row>
                                                    <Button variant='warning' className='rounded-pill' onClick={(e) => removeFromCart(productInfo.product)} style={{ width: "auto" }}>Remove from cart</Button>
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