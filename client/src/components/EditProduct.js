import React, { Fragment, useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { uploadToS3, backendServer } from './util';

export default function EditProduct({ showModal, setShowModal, productId }) {
    const [editProductForm, setEditProductForm] = useState({
        name: '',
        photo: '',
        category: '',
        description: '',
        price: '',
        quantityAvailable: '',
        productId: productId
    });
    const [image, setImage] = useState();
    const [validationErrors, setValidationErrors] = useState({});
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    const handleFormDataChange = (event) => {
        setEditProductForm({ ...editProductForm, [event.target.name]: event.target.value });
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
                setValidationErrors({});
                setImage(event.target.files[0]);
            }
        }
    }

    const editProduct = async (event) => {
        event.preventDefault();
        axios.defaults.withCredentials = true;
        let s3PhotoUrl;
        if (image) {
            s3PhotoUrl = await uploadToS3(image);
        }
        const response = await axios.post(backendServer + `/product/${productId}`,
            { ...editProductForm, photo: s3PhotoUrl ? s3PhotoUrl : editProductForm.photo },
            { validateStatus: status => status < 500 });
        if (response.status === 200) {
            toast.success('Product edited successfully!', { position: "top-center" });
            setShowModal(false);
            navigate(`/product/${productId}`);
        } else {
            setValidationErrors(response.data.errors);
        }
    }

    useEffect(async () => {
        axios.defaults.withCredentials = true;
        const { data: categories } = await axios.get(backendServer + '/category/all');
        setCategories(categories);
        const { data: productData } = await axios.get(backendServer + `/product/${productId}`);
        setEditProductForm(prevState => {
            let editProductForm = { ...prevState };
            editProductForm.name = productData.product.name;
            editProductForm.photo = productData.product.photo;
            editProductForm.category = productData.product.category.id;
            editProductForm.description = productData.product.description || '';
            editProductForm.price = productData.product.price;
            editProductForm.quantityAvailable = productData.product.quantity_available;
            return editProductForm;
        });
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
                        <b>Edit Product</b>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={(e) => editProduct(e)}>
                        <Form.Group className="mb-3">
                            <Form.Label>Name*</Form.Label>
                            <Form.Control type="text" name="name" value={editProductForm.name} onChange={(e) => handleFormDataChange(e)} autoFocus required />
                            <p style={{ color: 'red' }}>{validationErrors.name?.msg}</p>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Photo</Form.Label>
                            <Form.Control type="file" name="photo" accept="image/*" onChange={(e) => handleImageChange(e)} />
                            <p style={{ color: 'red' }}>{validationErrors.photo?.msg}</p>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Select Category</Form.Label>
                            <Form.Select name="category" value={editProductForm.category} onChange={(e) => handleFormDataChange(e)}>
                                {categories.map((category) => (
                                    <option value={category.id} key={category.id}>{category.name}</option>
                                ))}
                            </Form.Select>
                            <p style={{ color: 'red' }}>{validationErrors.category?.msg}</p>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control as="textarea" rows={3} name="description" value={editProductForm.description} onChange={(e) => handleFormDataChange(e)} />
                            <p style={{ color: 'red' }}>{validationErrors.description?.msg}</p>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Price*</Form.Label>
                            <Form.Control type="number" step="any" name="price" value={editProductForm.price} onChange={(e) => handleFormDataChange(e)} required />
                            <p style={{ color: 'red' }}>{validationErrors.price?.msg}</p>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Quantity Available*</Form.Label>
                            <Form.Control type="number" name="quantityAvailable" value={editProductForm.quantityAvailable} onChange={(e) => handleFormDataChange(e)} required />
                            <p style={{ color: 'red' }}>{validationErrors.quantityAvailable?.msg}</p>
                        </Form.Group>
                        <Button variant="primary" type="submit" className="rounded-pill">Edit Product</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Fragment>
    );
}