import React from 'react';
import {useSelector } from "react-redux";

const Banner = () => {
    const { products } = useSelector((state) => state.search);
    if (!products.any)
        return(
        <div className='container-fluid text-center p-3'>
            <img className='img-fluid' src='/images/logo240px.png' alt='logo Flask Damco'/>
        </div>
        )
  };
  
  export default Banner;