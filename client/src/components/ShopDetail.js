import React, { Fragment, useState, useEffect } from 'react';
import { Button, Form, Card, Row, Col, Image } from 'react-bootstrap';
import defaultShopImage from './../images/default_shop_image.png';
import defaultProfilePhoto from './../images/default_profile_photo.png';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import AddProduct from './AddProduct';
import AddCategory from './AddCategory';
import ProductList from './ProductList';
import EditShopImageModal from './EditShopImageModal';
import { backendServer } from './util';

export default function ShopDetail(props) {

    const params = useParams();
    const [shopId, setShopId] = useState(params.shopId);
    const [shopData, setShopData] = useState();
    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
    const [showEditShopImageModal, setShowEditShopImageModal] = useState(false);
    const [productsGrid, setProductsGrid] = useState([]);

    useEffect(async () => {
        axios.defaults.withCredentials = true;
        const { data: shopData } = await axios.get(backendServer + `/shop/${shopId}`);
        setShopData(shopData);
        let gridOfProducts = [];
        for (let i = 0; i < shopData.shop.products.length; i = i + 4) {
            gridOfProducts.push(shopData.shop.products.slice(i, i + 4));
        }
        setProductsGrid(gridOfProducts);
    }, []);

    return (
        <Fragment>
            {shopData && (
                <>
                    <Card>
                        <Card.Body>
                            <Row>
                                <Col sm={2}>
                                    <Image rounded width={150} height={160} src={shopData.shop.photo ? shopData.shop.photo : defaultShopImage} />
                                </Col>
                                <Col sm={4}>
                                    <Row><h3>{shopData.shop.name}</h3></Row>
                                    <Row><h6 style={{ fontWeight: "lighter" }}>{shopData.shop_total_sales} sales | On Etsy since {shopData.shop.created_on}</h6></Row>
                                    {shopData.is_owner && (
                                        <>
                                            <Row>
                                                <Button style={{ width: 'auto', marginLeft: '0.6rem', marginBottom: '0.75rem' }} onClick={(e) => setShowEditShopImageModal(true)} variant="outline-dark" className="rounded-pill">Edit Shop Image</Button>
                                            </Row>
                                            <Row>
                                                <Button style={{ width: 'auto', marginLeft: '0.6rem', marginRight: '0.6rem' }} onClick={(e) => setShowAddProductModal(true)} variant="outline-dark" className="rounded-pill">Add Product</Button>
                                                <Button style={{ width: 'auto' }} onClick={(e) => setShowAddCategoryModal(true)} variant="outline-dark" className="rounded-pill">Add Category</Button>
                                            </Row>
                                        </>
                                    )}
                                </Col>
                                <Col sm={4}></Col>
                                <Col sm={2}>
                                    <Row><h5>Shop Owner</h5></Row>
                                    <Image roundedCircle width={90} height={90} src={shopData.shop.owner.photo ? shopData.shop.owner.photo : defaultProfilePhoto} />
                                    <Row><span>{shopData.shop.owner.first_name}</span></Row>
                                    <Row><span>Ph No: {shopData.shop.owner.phone_number}</span></Row>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    <ProductList productsGrid={productsGrid} showEditButton={shopData.is_owner} />

                    {showAddProductModal && (
                        <AddProduct showModal={showAddProductModal} setShowModal={setShowAddProductModal} shopId={shopData.shop.id} />
                    )}

                    {showAddCategoryModal && (
                        <AddCategory showModal={showAddCategoryModal} setShowModal={setShowAddCategoryModal} />
                    )}

                    {showEditShopImageModal && (
                        <EditShopImageModal showModal={showEditShopImageModal} setShowModal={setShowEditShopImageModal} shopData={shopData} setShopData={setShopData} />
                    )}
                </>
            )}
        </Fragment>
    );
}