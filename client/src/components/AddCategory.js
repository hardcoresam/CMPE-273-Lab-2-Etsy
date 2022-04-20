import React, { Fragment, useEffect, useState } from 'react';
import { Modal, Button, Form, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendServer } from './util';

export default function AddCategory({ showModal, setShowModal }) {
    const [categoryName, setCategoryName] = useState();
    const [categories, setCategories] = useState([]);

    const addCategory = async (event) => {
        event.preventDefault();
        axios.defaults.withCredentials = true;
        const response = await axios.post(backendServer + '/category', { categoryName: categoryName });
        if (response.status === 200) {
            toast.success('Category added successfully!', { position: "top-center" });
            setShowModal(false);
        } else {
            toast.error('Adding category failed. Please try later!', { position: "top-center" });
        }
    }

    useEffect(async () => {
        axios.defaults.withCredentials = true;
        const { data: categories } = await axios.get(backendServer + '/category/all');
        setCategories(categories);
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
                        <b>Add Category</b>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    Existing categories are
                    <ListGroup>
                        {categories && categories.map((category) => (
                            <ListGroup.Item>{category.name}</ListGroup.Item>
                        ))}
                    </ListGroup>

                    <Form onSubmit={(e) => addCategory(e)}>
                        <Form.Group className="mb-3">
                            <Form.Label>Category Name*</Form.Label>
                            <Form.Control type="text" name="categoryName" onChange={(e) => setCategoryName(e.target.value)} placeholder="Enter category name" autoFocus required />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="rounded-pill">Add Category</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Fragment>
    );
}