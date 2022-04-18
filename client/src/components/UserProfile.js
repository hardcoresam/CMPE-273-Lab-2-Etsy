import React, { Fragment, useState, useEffect } from 'react';
import { Button, Form, Card, Row, Col, Image } from 'react-bootstrap';
import axios from 'axios';
import defaultProfilePhoto from './../images/default_profile_photo.png';
import { countries } from './util';
import { toast } from 'react-toastify';
import { uploadToS3, backendServer } from './util';

export default function UserProfile(props) {
    const [userProfileForm, setUserProfileForm] = useState({
        photo: '',
        firstName: '',
        lastName: '',
        gender: '',
        city: '',
        birthday: '',
        about: '',
        phoneNumber: '',
        email: '',
        country: '',
        streetAddress: '',
        aptNo: '',
        zipCode: '',
        state: '',
        country: ''
    });
    const [image, setImage] = useState({
        preview: '',
        raw: ''
    });

    const [validationErrors, setValidationErrors] = useState({});

    useEffect(async () => {
        axios.defaults.withCredentials = true;
        const { data: member } = await axios.get(backendServer + '/member');
        setUserProfileForm(prevState => {
            let userProfileForm = { ...prevState };
            userProfileForm.photo = member.photo;
            userProfileForm.firstName = member.first_name;
            userProfileForm.lastName = member.last_name;
            userProfileForm.gender = member.gender;
            userProfileForm.birthday = member.date_of_birth;
            userProfileForm.about = member.about;
            userProfileForm.phoneNumber = member.phone_number;
            userProfileForm.email = member.email;
            if (member.address) {
                userProfileForm.streetAddress = member.address.street_address;
                userProfileForm.aptNo = member.address.apt_no;
                userProfileForm.city = member.address.city;
                userProfileForm.zipCode = member.address.zipcode;
                userProfileForm.state = member.address.state;
                userProfileForm.country = member.address.country;
            }
            return userProfileForm;
        });
    }, []);

    const handleFormDataChange = (event) => {
        setUserProfileForm({ ...userProfileForm, [event.target.name]: event.target.value });
    }

    const editUserProfile = async (event) => {
        event.preventDefault();
        axios.defaults.withCredentials = true;
        let s3PhotoUrl;
        if (image.raw) {
            s3PhotoUrl = await uploadToS3(image.raw);
        }
        const response = await axios.post(backendServer + '/member',
            { ...userProfileForm, photo: s3PhotoUrl ? s3PhotoUrl : userProfileForm.photo },
            { validateStatus: status => status < 500 });
        if (response.status === 200) {
            toast.success('User profile edited successfully!', { position: "top-center" });
            setValidationErrors({});
        } else {
            setValidationErrors(response.data.errors);
        }
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
                setImage({
                    preview: URL.createObjectURL(event.target.files[0]),
                    raw: event.target.files[0]
                });
            }
        }
    }

    return (
        <Fragment>
            <h4 style={{ marginLeft: "15%", marginRight: "15%", marginTop: 15, textAlign: "center" }}>Your Public Profile</h4>
            <h6 style={{ marginLeft: "15%", marginRight: "15%", marginTop: 15, fontWeight: "lighter", textAlign: "center" }}>You can edit your details below</h6>
            <Card style={{ marginLeft: "15%", marginRight: "15%", marginTop: 15, marginBottom: 15 }}>
                <Card.Body>
                    <Form onSubmit={(e) => editUserProfile(e)}>
                        <Card.Text>
                            <Row style={{ margin: 15 }}>
                                <Col sm={5}>Profile Picture</Col>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Control type="file" accept="image/*" onChange={(e) => handleImageChange(e)} />
                                        <p style={{ color: 'red' }}>{validationErrors.photo?.msg}</p>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col sm={5}></Col>
                                <Col>
                                    <Image rounded width={150} height={150} src={image.preview ? image.preview : (userProfileForm.photo ? userProfileForm.photo : defaultProfilePhoto)} />
                                </Col>
                            </Row>
                            <Row>
                                <Col sm={5}></Col>
                                <Col>
                                    <h6 style={{ fontWeight: "lighter" }}>Must be a .jpg or .png file smaller than 10MB and at least 400px by 400px.</h6>
                                </Col>
                            </Row>

                            <hr />

                            <Row style={{ margin: 15 }}>
                                <Col sm={5}>First Name</Col>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Control type="text" name="firstName" value={userProfileForm.firstName} onChange={(e) => handleFormDataChange(e)} required />
                                        <p style={{ color: 'red' }}>{validationErrors.firstName?.msg}</p>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <hr />

                            <Row style={{ margin: 15 }}>
                                <Col sm={5}>Last Name</Col>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Control type="text" name="lastName" value={userProfileForm.lastName} onChange={(e) => handleFormDataChange(e)} />
                                        <p style={{ color: 'red' }}>{validationErrors.lastName?.msg}</p>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <hr />

                            <Row style={{ margin: 15 }}>
                                <Col sm={5}>Email</Col>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Control type="text" name="email" value={userProfileForm.email} disabled />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <hr />

                            <Row style={{ margin: 15 }}>
                                <Col sm={5}>Phone Number</Col>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Control type="number" name="phoneNumber" value={userProfileForm.phoneNumber} onChange={(e) => handleFormDataChange(e)} />
                                        <p style={{ color: 'red' }}>{validationErrors.phoneNumber?.msg}</p>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <hr />

                            <Row style={{ margin: 15 }}>
                                <Col sm={5}>Gender</Col>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Check inline type="radio" onChange={(e) => handleFormDataChange(e)} checked={userProfileForm.gender === 'MALE'} name="gender" label="Male" value="MALE" />
                                        <Form.Check inline type="radio" onChange={(e) => handleFormDataChange(e)} checked={userProfileForm.gender === 'FEMALE'} name="gender" label="Female" value="FEMALE" />
                                        <Form.Check inline type="radio" onChange={(e) => handleFormDataChange(e)} checked={userProfileForm.gender === 'RATHER_NOT_SAY'} name="gender" label="Rather not say" value="RATHER_NOT_SAY" />
                                        <p style={{ color: 'red' }}>{validationErrors.gender?.msg}</p>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <hr />

                            <Row style={{ margin: 15 }}>
                                <Col sm={5}>Birthday</Col>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Control type="date" name="birthday" value={userProfileForm.birthday} onChange={(e) => handleFormDataChange(e)} />
                                        <p style={{ color: 'red' }}>{validationErrors.birthday?.msg}</p>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <hr />

                            <Row style={{ margin: 15 }}>
                                <Col sm={5}>About</Col>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Control as="textarea" rows={3} name="about" value={userProfileForm.about} onChange={(e) => handleFormDataChange(e)} />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <hr />

                            <Row style={{ margin: 15 }}>
                                <Col sm={5}>Street Address</Col>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Control type="text" name="streetAddress" value={userProfileForm.streetAddress} onChange={(e) => handleFormDataChange(e)} />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <hr />

                            <Row style={{ margin: 15 }}>
                                <Col sm={5}>Apt No</Col>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Control type="text" name="aptNo" value={userProfileForm.aptNo} onChange={(e) => handleFormDataChange(e)} />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <hr />

                            <Row style={{ margin: 15 }}>
                                <Col sm={5}>Zip Code</Col>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Control type="number" name="zipCode" value={userProfileForm.zipCode} onChange={(e) => handleFormDataChange(e)} />
                                        <p style={{ color: 'red' }}>{validationErrors.zipCode?.msg}</p>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <hr />

                            <Row style={{ margin: 15 }}>
                                <Col sm={5}>City</Col>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Control type="text" name="city" value={userProfileForm.city} onChange={(e) => handleFormDataChange(e)} />
                                        <p style={{ color: 'red' }}>{validationErrors.city?.msg}</p>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <hr />

                            <Row style={{ margin: 15 }}>
                                <Col sm={5}>State</Col>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Control type="text" name="state" value={userProfileForm.state} onChange={(e) => handleFormDataChange(e)} />
                                        <p style={{ color: 'red' }}>{validationErrors.state?.msg}</p>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <hr />

                            <Row style={{ margin: 15 }}>
                                <Col sm={5}>Country</Col>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Select name="country" value={userProfileForm.country} onChange={(e) => handleFormDataChange(e)}>
                                            <option value={null}>Select your country</option>
                                            {countries && countries.map((country) => (
                                                <option value={country} key={country}>{country}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card.Text>
                        <Button variant="primary" style={{ width: "100%" }} type="submit" className="rounded-pill">Save Changes</Button>
                    </Form>
                </Card.Body>
            </Card>
        </Fragment >
    );
}