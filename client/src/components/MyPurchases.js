import React, { Fragment, useEffect, useState } from 'react';
import { Row, Button, Col, Image, Card } from 'react-bootstrap';
import defaultShopImage from './../images/default_shop_image.png';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { getCurrencySymbol, backendServer } from './util';

export default function MyPurchases(props) {
    const [ordersInfo, setOrdersInfo] = useState();
    const [currencySymbol, setCurrencySymbol] = useState('$');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [leftFlag, setLeftFlag] = useState(false);
    const [rightFlag, setRightFlag] = useState(true);

    useEffect(async () => {
        axios.defaults.withCredentials = true;
        const { data: orders } = await axios.get(backendServer + '/orders/?page=' + page + '&limit=' + limit);
        setOrdersInfo(orders.orders);
        const userCurrency = window.localStorage.getItem("user_currency");
        if (userCurrency) {
            setCurrencySymbol(getCurrencySymbol(userCurrency));
        }
        if (page <= 1) {
            setLeftFlag(false);
        } else {
            setLeftFlag(true);
        }
        if (orders.totalOrdersCount == page * limit || orders.orders.length < limit || orders.orders.length === 0) {
            setRightFlag(false);
        } else {
            setRightFlag(true);
        }
    }, [page, limit]);

    const leftclick = () => {
        if (!rightFlag) {
            setRightFlag(true);
        }
        setPage(page - 1);
    }

    const rightclick = () => {
        if (!leftFlag) {
            setLeftFlag(true);
        }
        setPage(page + 1);
    }

    const setLimitFunction = (e) => {
        setLimit(e.target.value)
        setPage(1);
    }

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
                    <h2 style={{ marginTop: "1%", textAlign: 'center' }}>Check your orders below</h2>
                    <Row style={{ marginLeft: "2%", marginRight: "3%" }}>
                        <Col style={{ fontSize: "1rem", fontWeight: "bold" }} sm={3}>Select orders per page:
                            <select type='select' onChange={(e) => setLimitFunction(e)}>
                                <option key={1} value={2}>{2}</option>
                                <option key={2} selected value={5}>{5}</option>
                                <option key={3} value={10}>{10}</option>
                            </select> </Col>
                        <Col sm={6}></Col>
                        <Col>
                            <Row>
                                <Col></Col>
                                <Col></Col>
                                <Col>
                                    <Button disabled={!leftFlag} onClick={leftclick}>Prev</Button>
                                </Col>
                                <Col sm={3}>Page {page}</Col>
                                <Col>
                                    <Button disabled={!rightFlag} onClick={rightclick}>Next</Button>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
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
                                            {ordered_product.note_to_seller && (
                                                <Row><h5>Note to seller: {ordered_product.note_to_seller}</h5></Row>
                                            )}
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