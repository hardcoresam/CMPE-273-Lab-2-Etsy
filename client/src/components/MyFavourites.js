import React, { Fragment, useState, useEffect } from 'react';
import { Button, FormControl, Form, Card, Row, Col, Image } from 'react-bootstrap';
import axios from 'axios';
import defaultProfilePhoto from './../images/default_profile_photo.png';
import { useNavigate } from 'react-router-dom';
import ProductList from './ProductList';
import { backendServer } from './util';

export default function MyFavourites(props) {
    const [productsList, setProductsList] = useState([]);
    const [productsGrid, setProductsGrid] = useState([]);
    const [searchedText, setSearchedText] = useState();
    const [memberInfo, setMemberInfo] = useState();
    const navigate = useNavigate();

    useEffect(async () => {
        axios.defaults.withCredentials = true;
        const { data } = await axios.get(backendServer + '/favourites-of-member');
        setMemberInfo({
            photo: data.photo,
            userName: data.first_name
        });
        let setOfProducts = [];
        data.favouriteProducts.map((favourite) => {
            setOfProducts.push(favourite);
        });
        setProductsList(setOfProducts);
        let gridOfProducts = [];
        for (let i = 0; i < setOfProducts.length; i = i + 4) {
            gridOfProducts.push(setOfProducts.slice(i, i + 4));
        }
        setProductsGrid(gridOfProducts);
    }, []);

    const handleEditUserClick = (event) => {
        navigate("/user-profile");
    }

    const searchYourFavourites = (event) => {
        event.preventDefault();
        let setOfProducts = [];
        productsList.forEach((product) => {
            if (product.name.toLowerCase().includes(searchedText.toLowerCase())) {
                setOfProducts.push(product);
            }
        });
        let gridOfProducts = [];
        for (let i = 0; i < setOfProducts.length; i = i + 4) {
            gridOfProducts.push(setOfProducts.slice(i, i + 4));
        }
        setProductsGrid(gridOfProducts);
    }

    return (
        <Fragment>
            {memberInfo && (
                <>
                    <Card>
                        <Card.Body>
                            <Row>
                                <Col sm={2}>
                                    <Image rounded width={150} height={150} src={memberInfo.photo ? memberInfo.photo : defaultProfilePhoto} />
                                </Col>
                                <Col sm={3}>
                                    <Row>
                                        <h3>
                                            {memberInfo.userName}
                                            <Button variant="light" onClick={(e) => handleEditUserClick(e)}><i className="fa-solid fa-pen" aria-hidden="true" /></Button>
                                        </h3>
                                    </Row>
                                    <Row><h6 style={{ fontWeight: "lighter" }}>Find your favourites below</h6></Row>
                                </Col>
                            </Row>
                            <Row></Row>
                            <Row>
                                <Col sm={2}><h4>Favourite Items</h4></Col>
                                <Col sm={6}></Col>
                                <Col sm={4}>
                                    <Form className="d-flex" onSubmit={(e) => searchYourFavourites(e)}>
                                        <FormControl type="search" name="searchedText" onChange={(e) => setSearchedText(e.target.value)} placeholder="Search your favourites" className="me-2" aria-label="Search" />
                                        <Button variant="outline-success" type="submit"><i className="fa fa-search" aria-hidden="true" /></Button>
                                    </Form>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    <ProductList productsGrid={productsGrid} showEditButton={false} />
                </>
            )}
        </Fragment>
    );
}