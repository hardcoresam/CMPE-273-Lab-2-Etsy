import React, { Fragment, useEffect, useState } from 'react';
import { Card, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductList from './ProductList';
import { isLoggedIn, backendServer } from './util';
import { useDispatch } from "react-redux";
import { stateReducer } from '../features/productSlice';

export default function Home(props) {
    const [member, setMember] = useState({ first_name: '' });
    const [loggedIn, setLoggedIn] = useState(false);
    const dispatch = useDispatch();

    useEffect(async () => {
        setLoggedIn(isLoggedIn());
        if (isLoggedIn()) {
            axios.defaults.withCredentials = true;
            const { data: member } = await axios.get(backendServer + '/member');
            setMember(member);
            const { data: products } = await axios.get(backendServer + '/product/all');
            let gridOfProducts = [];
            for (let i = 0; i < products.length; i = i + 4) {
                gridOfProducts.push(products.slice(i, i + 4));
            }
            dispatch(stateReducer(gridOfProducts))
        }
    }, []);

    return (
        <Fragment>
            <Card >
                <Card.Body style={{ backgroundColor: "#FDEBD2", height: "100%" }}>
                    <Row>
                        {loggedIn && (
                            <>
                                <h2 style={{ textAlign: 'center' }}>Welcome back, <Link style={{ color: 'black' }} to="/user-profile">{member.first_name}</Link>!</h2>
                                <h4 style={{ textAlign: 'center' }}>Explore our beloved products. Shop Now!</h4>
                            </>
                        )}
                        {!loggedIn && (
                            <>
                                <h2 style={{ textAlign: 'center' }}>Explore one-of-a-kind finds from independent makers</h2>
                                <h5 style={{ textAlign: 'center' }}>Please login or register to use Etsy!</h5>
                                <br /><br />
                                <h3 style={{ textAlign: 'center' }}>What is Etsy?</h3>
                                <br /><br /><br />
                                <h5 style={{ textAlign: 'center' }}>A community doing good</h5>
                                <span style={{ textAlign: 'center' }}>Etsy is a global online marketplace, where people come together to make, sell, buy, and collect unique items. We’re also a community pushing for positive change for small businesses, people, and the planet.</span>
                                <br /><br /><br />
                                <h5 style={{ textAlign: 'center' }}>Support independent creators</h5>
                                <span style={{ textAlign: 'center' }}>There’s no Etsy warehouse – just millions of people selling the things they love. We make the whole process easy, helping you connect directly with makers to find something extraordinary.</span>
                                <br /><br /><br />
                                <h5 style={{ textAlign: 'center' }}>Peace of mind</h5>
                                <span style={{ textAlign: 'center' }}>Your privacy is the highest priority of our dedicated team. And if you ever need assistance, we are always ready to step in for support.</span>
                            </>
                        )}
                    </Row>
                </Card.Body>
            </Card>

            {loggedIn && (
                <ProductList showEditButton={false} />
            )}
        </Fragment>
    );
}