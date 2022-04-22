import React, { Fragment, useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { backendServer } from './util';
import { loginFail, loginSuccess, loginPending } from "../features/loginSlice";
import { useDispatch, useSelector } from "react-redux";

export default function Signin({ showModal, setShowModal }) {
    const [signinForm, setSigninForm] = useState({
        email: '',
        password: ''
    });
    const [validationErrors, setValidationErrors] = useState({});
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const obj = useSelector(state => state.login);
    const { isLoading } = obj.value;

    const handleFormDataChange = (event) => {
        setSigninForm({ ...signinForm, [event.target.name]: event.target.value });
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        axios.defaults.withCredentials = true;
        dispatch(loginPending());
        const response = await axios.post(backendServer + '/auth/login', { ...signinForm },
            { validateStatus: status => status < 500 });
        if (response.status === 200) {
            dispatch(loginSuccess());
            setShowModal(false);
            window.localStorage.setItem("user_currency", response.data.member.currency);
            navigate("/home");
            window.location.reload();
        } else {
            dispatch(loginFail(response.data.errors));
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
                        <b>Sign in</b>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={(e) => handleSubmit(e)}>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Email address*</Form.Label>
                            <Form.Control type="email" name="email" onChange={(e) => handleFormDataChange(e)} placeholder="Enter your email" autoFocus required />
                            <p style={{ color: 'red' }}>{validationErrors.email?.msg}</p>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Password*</Form.Label>
                            <Form.Control type="password" name="password" onChange={(e) => handleFormDataChange(e)} placeholder="Enter your Password" required />
                            <p style={{ color: 'red' }}>{validationErrors.password?.msg}</p>
                        </Form.Group>
                        <Button variant="primary" type="submit" className="rounded-pill">Sign in</Button>
                    </Form>
                    {isLoading && <Spinner variant="primary" animation="border" />}
                </Modal.Body>
            </Modal>
        </Fragment>
    );
}