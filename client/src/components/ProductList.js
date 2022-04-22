import React, { Fragment, useState, useEffect } from 'react';
import { Button, Card, Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import defaultShopImage from './../images/default_shop_image.png';
import EditProduct from './EditProduct';
import { getCurrencySymbol, backendServer } from './util';
import { useSelector } from 'react-redux'
import { favstateReducer } from '../features/productSlice';
import { useDispatch } from "react-redux";

export default function ProductList({ showEditButton }) {
    const [showEditProductModal, setShowEditProductModal] = useState(false);
    const [toEditProductId, setToEditProductId] = useState();
    const [favourites, setFavourites] = useState([]);
    const [currencySymbol, setCurrencySymbol] = useState('$');
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const obj = useSelector(state => state.products);
    const { statestatus } = obj.value;
    const obj3 = useSelector(state => state.products);
    const { flag } = obj3.value;

    useEffect(async () => {
        axios.defaults.withCredentials = true;
        const { data: favourites } = await axios.get(backendServer + '/favourite/all');
        setFavourites(favourites);
        const userCurrency = window.localStorage.getItem("user_currency");
        if (userCurrency) {
            setCurrencySymbol(getCurrencySymbol(userCurrency));
        }
    }, []);

    const setEditModalProps = (product) => {
        setShowEditProductModal(true);
        setToEditProductId(product.id);
    }

    const modifyFavourites = async (product) => {
        axios.defaults.withCredentials = true;
        const { data: favourites } = await axios.post(backendServer + '/favourite', { productId: product.id });
        setFavourites(favourites);
        dispatch(favstateReducer(!flag));
    }

    const handleProductClick = (product) => {
        navigate(`/product/${product.id}`);
    }

    return (
        <Fragment>
            {statestatus && statestatus.map((products) => (
                <Row style={{ marginLeft: "2%", marginRight: "2%", marginTop: "1%", marginBottom: "1%" }}>
                    {products.map((product) => (
                        <Card className="ms-2" style={{ width: '18rem' }}>
                            <Card.Img onClick={() => handleProductClick(product)} style={{ cursor: "pointer" }} variant="top" src={product.photo ? product.photo : defaultShopImage} />
                            <Card.Body>
                                <Card.Title>{product.name}</Card.Title>
                                <Card.Text>
                                    <Row>
                                        <Col sm={5}>
                                            {currencySymbol}{product.price}
                                        </Col>

                                        <Col sm={3}>
                                            <OverlayTrigger
                                                placement="right"
                                                overlay={<Tooltip id="button-tooltip">Add/Remove from Favourites</Tooltip>}
                                            >
                                                <Button variant="light" onClick={() => modifyFavourites(product)}>
                                                    {favourites.includes(product.id) ?
                                                        <i style={{ color: 'red' }} className="fa fa-heart" aria-hidden="true" /> :
                                                        <i className="fa-regular fa-heart" aria-hidden="true" />
                                                    }
                                                </Button>
                                            </OverlayTrigger>
                                        </Col>

                                        {showEditButton && (
                                            <Col sm={4}>
                                                <Button style={{ width: 'auto' }} onClick={(e) => setEditModalProps(product)} variant="outline-dark">Edit</Button>
                                            </Col>
                                        )}
                                    </Row>
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    ))}
                </Row>
            ))}

            {showEditProductModal && (
                <EditProduct showModal={showEditProductModal} setShowModal={setShowEditProductModal} productId={toEditProductId} />
            )}
        </Fragment>
    );
}