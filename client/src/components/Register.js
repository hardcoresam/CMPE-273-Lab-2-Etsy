import React, { Fragment, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { backendServer } from './util';

export default function Register({ showModal, setShowModal }) {
    const [registerForm, setRegisterForm] = useState({
        email: '',
        firstName: '',
        password: ''
    });
    const [validationErrors, setValidationErrors] = useState({});
    const navigate = useNavigate();

    const handleFormDataChange = (event) => {
        setRegisterForm({ ...registerForm, [event.target.name]: event.target.value });
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        axios.defaults.withCredentials = true;
        const response = await axios.post(backendServer + '/auth/register', { ...registerForm },
            { validateStatus: status => status < 500 });
        if (response.status === 200) {
            setShowModal(false);
            window.localStorage.setItem("user_currency", response.data.currency);
            navigate("/home");
            window.location.reload();
        } else {
            setValidationErrors(response.data.errors);
        }
    }

    return (
        <Fragment>
            <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                backdrop="static"
                keyboard={false}
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <b>Create your account</b>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={(e) => handleSubmit(e)}>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Email address*</Form.Label>
                            <Form.Control type="email" name="email" onChange={(e) => handleFormDataChange(e)} placeholder="Enter your email" autoFocus required />
                            <p style={{ color: 'red' }}>{validationErrors.email?.msg}</p>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicFirstName">
                            <Form.Label>First name*</Form.Label>
                            <Form.Control type="text" name="firstName" onChange={(e) => handleFormDataChange(e)} placeholder="Enter your first name" required />
                            <p style={{ color: 'red' }}>{validationErrors.firstName?.msg}</p>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Password*</Form.Label>
                            <Form.Control type="password" name="password" onChange={(e) => handleFormDataChange(e)} placeholder="Enter your Password" required />
                            <p style={{ color: 'red' }}>{validationErrors.password?.msg}</p>
                        </Form.Group>
                        <Button variant="primary" type="submit" className="rounded-pill">Register</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Fragment>
    );
}