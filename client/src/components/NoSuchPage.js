import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';

export default function NoSuchPage(props) {

    return (
        <Fragment>
            <div style={{marginTop: '6rem'}}>
                <h3 style={{ textAlign: 'center' }}>Uh oh!</h3>
                <h4 style={{ textAlign: 'center' }}>Sorry, the page you were looking for was not found.</h4>
                <h4 style={{ textAlign: 'center' }}><Link to="/home"><i className="fa-solid fa-arrow-left" aria-hidden="true" /> Go back to Etsy.com</Link></h4>
            </div>
        </Fragment>
    );
}