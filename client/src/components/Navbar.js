import React, { Fragment, useEffect, useState } from 'react';
import { Navbar, NavDropdown, Container, FormControl, Form, Button, Col } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import cookie from 'react-cookies';
import Register from './Register';
import Signin from './Signin';
import { isLoggedIn } from './util';
import { toast } from 'react-toastify';

export default function NavBar(props) {
    const [loggedIn, setLoggedIn] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [searchedText, setSearchedText] = useState();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        setLoggedIn(isLoggedIn());
    }, [location]);

    const handleLogout = (event) => {
        cookie.remove('access-token', { path: '/' });
        setLoggedIn(false);
        toast.success('Logged out successfully!', { position: "top-center" });
        navigate("/");
        window.location.reload();
    }

    const handleFavouritesClick = (event) => {
        navigate("/my-favourites");
    }

    const handleCartClick = (event) => {
        navigate("/cart");
    }

    const search = (event) => {
        event.preventDefault();
        if (isLoggedIn()) {
            navigate('/search?text=' + searchedText);
        } else {
            toast.error('Please login/register first to use Etsy features.', { position: "top-center" });
        }
    }

    return (
        <Fragment>
            <Navbar bg="light" expand="lg" style={{ paddingLeft: "2rem" }}>
                <Container fluid>
                    <Navbar.Brand href="#"><Link className='logo' to="/home">Etsy</Link></Navbar.Brand>
                    <Navbar.Toggle aria-controls="navbarScroll" />
                    <Navbar.Collapse id="navbarScroll">
                        <Form className="d-flex" onSubmit={(e) => search(e)} style={{ width: "70%" }}>
                            <FormControl style={{ border: "1px solid black" }} className="me-1 rounded-pill" type="search" onChange={(e) => setSearchedText(e.target.value)} placeholder="Search for anything" aria-label="Search" />
                            <Button variant="outline-dark" className="rounded-pill" type="submit">Search</Button>
                        </Form>

                        {loggedIn && (
                            <>
                                <Button style={{ fontSize: "1.5rem", marginLeft: "2rem" }} variant="light" onClick={(e) => handleFavouritesClick(e)}><i style={{ color: 'red' }} className="fa-solid fa-heart" aria-hidden="true" /></Button>
                                <NavDropdown style={{ fontSize: "1.5rem", marginLeft: "2rem" }} title={(<i style={{ color: 'blue' }} className="fa-solid fa-circle-user" aria-hidden="true"></i>)}>
                                    <NavDropdown.Item ><Link className='user-profile-link' to="/user-profile"><span>My Profile</span></Link></NavDropdown.Item>
                                    <NavDropdown.Item ><Link className='user-profile-link' to="/shop"><span>My Shop</span></Link></NavDropdown.Item>
                                    <NavDropdown.Item ><Link className='user-profile-link' to="/orders"><span>My Purchases</span></Link></NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item><Button variant="dark" onClick={(e) => handleLogout(e)}>Sign out</Button></NavDropdown.Item>
                                </NavDropdown>
                                <Button style={{ fontSize: "1.5rem", marginLeft: "2rem" }} variant="light" onClick={(e) => handleCartClick(e)}><i className="fa-solid fa-cart-shopping" aria-hidden="true" /></Button>
                            </>
                        )}

                        {!loggedIn && (
                            <>
                                <Button style={{ marginLeft: "1.5rem", marginRight: "0.75rem" }} variant="outline-dark" onClick={(e) => setShowLoginModal(true)} className="rounded-pill">Login</Button>
                                <Button style={{ marginLeft: "0.75rem", marginRight: "1rem" }} variant="outline-dark" onClick={(e) => setShowRegisterModal(true)} className="rounded-pill">Register</Button>
                            </>
                        )}

                        {!loggedIn && showLoginModal && (
                            <Signin showModal={showLoginModal} setShowModal={setShowLoginModal} />
                        )}

                        {!loggedIn && showRegisterModal && (
                            <Register showModal={showRegisterModal} setShowModal={setShowRegisterModal} />
                        )}

                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </Fragment>
    );
}