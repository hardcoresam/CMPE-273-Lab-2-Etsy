import React, { Fragment, useState, useEffect } from 'react';
import { Button, FormControl, InputGroup, Card } from 'react-bootstrap'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { backendServer } from './util';

export default function MyShops(props) {
    const [shopId, setShopId] = useState();
    const [shopName, setShopName] = useState('');
    const [shopNameAvailable, setShopNameAvailable] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const navigate = useNavigate();

    useEffect(async () => {
        axios.defaults.withCredentials = true;
        const { data: shop } = await axios.get(backendServer + '/shop');
        if (shop !== null) {
            setShopId(shop.id);
        }
    }, []);

    const checkAvailability = async (event) => {
        setShowMessage(true);
        axios.defaults.withCredentials = true;
        const response = await axios.post(backendServer + '/shop/available', { shopName: shopName }, {
            validateStatus: status => status < 500
        });
        if (response.status === 200) {
            setValidationErrors({});
            setShopNameAvailable(response.data.available);
        } else {
            setShopNameAvailable(false);
            setValidationErrors(response.data.errors);
        }
    }

    const createShop = async (event) => {
        axios.defaults.withCredentials = true;
        const response = await axios.post(backendServer + '/shop', { shopName: shopName });
        if (response.status === 200) {
            toast.success('Shop created successfully!', { position: "top-center" });
            navigate(`/shop/${response.data.newShopId}`);
        } else {
            toast.error('Failed to create shop. Please try later!', { position: "top-center" });
        }
    }

    return (
        <Fragment>
            {/*If shop is already present for this guy*/}
            {shopId && navigate(`/shop/${shopId}`)}

            {/*If shop is not present for this guy, then shop creation UI will be shown*/}
            <div style={{ marginLeft: "15%", marginRight: "15%", marginTop: "4%" }}>
                <h5 style={{ fontWeight: "lighter", textAlign: 'center' }}>Seems like you don't have a shop yet. You can create it easily from below</h5>
                <br />
                <h2 style={{ textAlign: 'center' }}>Name your Shop</h2>
                <h5 style={{ fontWeight: "lighter", textAlign: 'center' }}>Choose a memorable name that reflects your style</h5>
            </div>
            <br />
            <Card>
                <Card.Body style={{ marginLeft: "15%", marginRight: "15%" }}>
                    <InputGroup className="mb-3">
                        <FormControl type="text" placeholder="Enter your shop name" onChange={(e) => setShopName(e.target.value)} />
                        <Button variant="outline-secondary" onClick={(e) => checkAvailability(e)}>Check availability</Button>
                    </InputGroup>
                    <p style={{ color: 'red' }}>{validationErrors.shopName?.msg}</p>
                    {showMessage && shopNameAvailable && (
                        <>
                            <h5 style={{ textAlign: 'center' }}>Shop name is available. Go ahead and create your shop from below.</h5>
                            <div style={{ textAlign: 'center' }}>
                                <Button variant="outline-primary" onClick={(e) => createShop(e)} className="rounded-pill">Create Shop</Button>
                            </div>
                        </>
                    )}

                    {showMessage && !shopNameAvailable && (
                        <h5 style={{ textAlign: 'center' }}>The above shop name is not available currently. Please change it and give it a try.</h5>
                    )}

                    <h6 style={{ textAlign: 'center' }}>Your shop name will appear in your shop and next to each of your listings throughout Etsy.</h6>
                </Card.Body>
            </Card>
        </Fragment>
    );
}