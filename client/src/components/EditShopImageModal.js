import React, { Fragment, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { uploadToS3, backendServer } from './util';

export default function EditShopImageModal({ showModal, setShowModal, shopData, setShopData }) {
    const [shopImage, setShopImage] = useState();
    const [validationErrors, setValidationErrors] = useState({});
    const navigate = useNavigate();

    const handleImageChange = (event) => {
        if (event.target.files.length) {
            if (!["image/jpg", "image/jpeg", "image/png"].includes(event.target.files[0].type)) {
                setValidationErrors({
                    photo: {
                        msg: 'Please upload only jpg, jpeg or png files'
                    }
                });
            } else {
                setShopImage(event.target.files[0]);
            }
        }
    }

    const editShopImage = async (event) => {
        event.preventDefault();
        if (!shopImage) {
            toast.error('Please select an image to edit shop photo', { position: "top-center" });
            return;
        }
        axios.defaults.withCredentials = true;
        let s3PhotoUrl = await uploadToS3(shopImage);
        const response = await axios.post(backendServer + '/shop/image', { shopId: shopData.shop.id, shopImage: s3PhotoUrl });
        if (response.status === 200) {
            toast.success('Shop Image edited successfully!', { position: "top-center" });
            setShowModal(false);
            setShopData({ ...shopData, 'shop.photo': s3PhotoUrl });
        } else {
            toast.error('Failed to upload shop image. Please try later!', { position: "top-center" });
        }
    }

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
                        <b>Edit Shop Image</b>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={(e) => editShopImage(e)}>
                        <Form.Group className="mb-3">
                            <Form.Label>Shop Image</Form.Label>
                            <Form.Control type="file" name="shopImage" accept="image/*" onChange={(e) => handleImageChange(e)} />
                            <p style={{ color: 'red' }}>{validationErrors.photo?.msg}</p>
                        </Form.Group>
                        <Button variant="primary" type="submit" className="rounded-pill">Save Shop Image</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Fragment>
    );
}