import React, { Fragment, useEffect, useState } from 'react';
import { Row, Col, Image, Card } from 'react-bootstrap';
import defaultShopImage from './../images/default_shop_image.png';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { getCurrencySymbol, backendServer } from './util';

export default function MyPurchases(props) {
    const [ordersInfo, setOrdersInfo] = useState();
    const [currencySymbol, setCurrencySymbol] = useState('$');

    useEffect(async () => {
        axios.defaults.withCredentials = true;
        const { data: orders } = await axios.get(backendServer + '/orders');
        setOrdersInfo(orders);
        const userCurrency = window.localStorage.getItem("user_currency");
        if (userCurrency) {
            setCurrencySymbol(getCurrencySymbol(userCurrency));
        }
    }, []);

    const calculateOrderTotal = (order) => {
        let total = 0;
        order.ordered_products.map((ordered_product) => {
            total = total + (ordered_product.price * ordered_product.quantity);
        })
        return total;
    }

    return (
        <Fragment>
            {(!ordersInfo || ordersInfo.length === 0) && (
                <div style={{ marginLeft: "15%", marginRight: "15%", marginTop: "10%", textAlign: 'center' }}>
                    <h2>You don't have any purchases.</h2>
                    <h4 style={{ fontWeight: "lighter" }}><a href="/home">No Problem! Browse Etsy for awesome items.</a></h4>
                </div>
            )}

            {ordersInfo && ordersInfo.length > 0 && (
                <>
                    <h2 style={{ marginTop: "1%", textAlign: 'center' }}>Check your purchases below</h2>
                    {ordersInfo.map((order) => (
                        <Card style={{ marginLeft: "5%", marginRight: "5%", marginTop: 15, marginBottom: 15 }}>
                            <Card.Body>
                                <Card.Title>Order ID: {order.id} placed on {order.placed_on} totalling {currencySymbol}{calculateOrderTotal(order)}.</Card.Title>
                            </Card.Body>
                            {order.ordered_products.map((ordered_product) => (
                                <Card.Body>
                                    <Row>
                                        <Col sm={3}>
                                            <Image rounded width={190} height={170} src={ordered_product.product.photo ? ordered_product.product.photo : defaultShopImage} />
                                        </Col>
                                        <Col sm={9}>
                                            <Row><h3>Name: {ordered_product.product.name}</h3></Row>
                                            <Row><h6>Shop : <Link to={'/shop/' + ordered_product.product.shop.id}>{ordered_product.product.shop.name}</Link></h6></Row>
                                            <Row><h5>Price per unit: {currencySymbol}{ordered_product.price}</h5></Row>
                                            <Row><h5>Quantity: {ordered_product.quantity}</h5></Row>
                                            {ordered_product.gift_packing && (
                                                <Row><h5>This item is ordered as a gift product</h5></Row>
                                            )}
                                            <Row><h5>Note to seller: {ordered_product.note_to_seller}</h5></Row>
                                            <Row><h5>Total: {currencySymbol}{ordered_product.price} * {ordered_product.quantity} = {currencySymbol}{ordered_product.price * ordered_product.quantity}</h5></Row>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            ))}
                        </Card>
                    ))}
                </>
            )}
        </Fragment>
    );
}