import React, { Fragment, useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { uploadToS3, backendServer } from './util';

export default function AddProduct({ showModal, setShowModal, shopId }) {
    const [addProductForm, setAddProductForm] = useState({
        name: '',
        photo: '',
        category: '',
        description: '',
        price: '',
        quantityAvailable: '',
        shopId: shopId
    });
    const [validationErrors, setValidationErrors] = useState({});
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    const handleFormDataChange = (event) => {
        setAddProductForm({ ...addProductForm, [event.target.name]: event.target.value });
    }

    const handleImageChange = (event) => {
        if (event.target.files.length) {
            if (!["image/jpg", "image/jpeg", "image/png"].includes(event.target.files[0].type)) {
                setValidationErrors({
                    photo: {
                        msg: 'Please upload only jpg, jpeg or png files'
                    }
                });
            } else {
                setAddProductForm({ ...addProductForm, photo: event.target.files[0] });
            }
        }
    }

    const addProduct = async (event) => {
        event.preventDefault();
        axios.defaults.withCredentials = true;
        let s3PhotoUrl;
        if (addProductForm.photo) {
            s3PhotoUrl = await uploadToS3(addProductForm.photo);
        }
        const response = await axios.post(backendServer + '/product',
            { ...addProductForm, photo: s3PhotoUrl },
            { validateStatus: status => status < 500 });
        if (response.status === 200) {
            toast.success('Product added successfully!', { position: "top-center" });
            setShowModal(false);
            navigate(`/product/${response.data.id}`);
        } else {
            setValidationErrors(response.data.errors);
        }
    }

    useEffect(async () => {
        axios.defaults.withCredentials = true;
        const { data: categories } = await axios.get(backendServer + '/category/all');
        setCategories(categories);
        //setting the first category value which we will show in the UI to the form 
        setAddProductForm({ ...addProductForm, category: categories[0].id });
    }, []);

    return (
        <Fragment>
            <Modal
                size="lg"
                show={showModal}
                onHide={() => setShowModal(false)}
                backdrop="static"
                keyboard={false}
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <b>Add Product</b>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={(e) => addProduct(e)}>
                        <Form.Group className="mb-3">
                            <Form.Label>Name*</Form.Label>
                            <Form.Control type="text" name="name" onChange={(e) => handleFormDataChange(e)} placeholder="Enter product name" autoFocus required />
                            <p style={{ color: 'red' }}>{validationErrors.name?.msg}</p>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Photo</Form.Label>
                            <Form.Control type="file" name="photo" accept="image/*" onChange={(e) => handleImageChange(e)} />
                            <p style={{ color: 'red' }}>{validationErrors.photo?.msg}</p>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Select Category</Form.Label>
                            <Form.Select name="category" onChange={(e) => handleFormDataChange(e)}>
                                {categories.map((category) => (
                                    <option value={category.id} key={category.id}>{category.name}</option>
                                ))}
                            </Form.Select>
                            <p style={{ color: 'red' }}>{validationErrors.category?.msg}</p>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control as="textarea" rows={3} name="description" onChange={(e) => handleFormDataChange(e)} placeholder="Enter product description" />
                            <p style={{ color: 'red' }}>{validationErrors.description?.msg}</p>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Price*</Form.Label>
                            <Form.Control type="number" step="any" name="price" onChange={(e) => handleFormDataChange(e)} placeholder="Enter product price" required />
                            <p style={{ color: 'red' }}>{validationErrors.price?.msg}</p>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Quantity Available*</Form.Label>
                            <Form.Control type="number" name="quantityAvailable" onChange={(e) => handleFormDataChange(e)} placeholder="Enter product quantity" required />
                            <p style={{ color: 'red' }}>{validationErrors.quantityAvailable?.msg}</p>
                        </Form.Group>
                        <Button variant="primary" type="submit" className="rounded-pill">Add Product</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Fragment>
    );
}