import React, { Fragment, useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { getCurrencySymbol, isLoggedIn, backendServer } from './util';

export default function Footer() {
    const [currency, setCurrency] = useState();
    const [country, setCountry] = useState('United States');
    const [showCurrencyEditModal, setShowCurrencyEditModal] = useState(false);
    const [toChangeCurrency, setToChangeCurrency] = useState('USD');

    useEffect(async () => {
        axios.defaults.withCredentials = true;
        if (isLoggedIn()) {
            const { data: member } = await axios.get(backendServer + '/member');
            setCountry(member.address.country);
            setCurrency(member.currency);
        }
    }, []);

    const saveCurrencyChange = async (event) => {
        event.preventDefault();
        axios.defaults.withCredentials = true;
        await axios.post(backendServer + '/member/currency', { currency: toChangeCurrency });
        window.localStorage.setItem("user_currency", toChangeCurrency);
        window.location.reload();
    }

    return (
        <Fragment>
            <div style={{ backgroundColor: "#232347", color: 'white', paddingLeft: "2.5rem", height: '3rem' }}>
                <Row style={{ margin: 0 }}>
                    <Col sm='auto'><h6></h6>{country ? country : <span>United States</span>} | English(US)</Col>
                    <Col sm={2}>
                        <h6></h6>
                        {getCurrencySymbol(currency)}{currency ? currency : <span>USD</span>}
                        <Button style={{ color: "white" }} className='rounded-pill' onClick={(e) => setShowCurrencyEditModal(true)} variant='link' disabled={!isLoggedIn()}>Edit</Button>
                    </Col>
                    <Col sm={3}></Col>
                    <Col sm={4}><h6></h6><span style={{ paddingLeft: '4rem', fontSize: '16.5px' }}>© 2022 Etsy, Inc. Developed by Sai Krishna.</span></Col>
                </Row>
            </div>

            <Modal
                show={showCurrencyEditModal}
                onHide={() => setShowCurrencyEditModal(false)}
                backdrop="static"
                keyboard={false}
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <b>Update currency here</b>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={(e) => saveCurrencyChange(e)}>
                        <Form.Group className="mb-3">
                            <Form.Label>Currency</Form.Label>
                            <Form.Select name="currency" onChange={(e) => setToChangeCurrency(e.target.value)}>
                                <option value="USD">$ United States Dollar (USD)</option>
                                <option value="INR">₹ Indian Rupee (INR)</option>
                                <option value="EUR">€ Euro (EUR)</option>
                                <option value="GBP">£ British Pound (GBP)</option>
                                <option value="JPY">¥ Japanese Yen (JPY)</option>
                            </Form.Select>
                        </Form.Group>
                        <Button variant="dark" type="submit" className="rounded-pill">Save</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Fragment >
    );
}