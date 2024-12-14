import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Spin } from 'antd';
import styled from 'styled-components';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button, FormGroup, FormLabel } from 'react-bootstrap';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import 'datatables.net-dt/css/dataTables.dataTables.css';
DataTable.use(DT);
// Styled Components
const Container = styled.div`
`;

const ProductListContainer = styled.ul`
  list-style-type: none;
  padding: 0;
`;
const Error = styled.div`
color: red;
font-size: 0.9rem;
margin-top: 5px;
`;
const StyledButton = styled.button`
    background-color: #007bff;
    color: white;
    padding: .375rem .75rem;
    margin-left: .2rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;

    &:hover {
        background-color: #0056b3;
    }

    &:disabled {
        background-color: #ccc;
        cursor: not-allowed;
    }
`;
// Component
const ProductList = () => {
  const [search, setSearch] = useState()
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState();
  const [error, setError] = useState(null);

  useEffect(() => {
    if(search)
      axios
      .get('damco-search?search=' + search)
      .then((response) => {
        setProducts(response.data.list_products);
        setLoading(false);
        setSearch();
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
        setSearch();
      });
 }, [search]);

  const handleSubmit = (values, { resetForm }) => {
        setLoading(true);
        setSearch(values.search);
        resetForm();
  };

  return (
    <div>
      {products.length === 0 && (
        <FlaskLogo/>
      )}
      <div className='container-fluid text-center p-3'>
        <h1>Search the Damco catalog </h1>
        <SearchForm handleSubmit={handleSubmit}/>
        <img className='preload-image' src='/images/loading.gif' alt='loading...'/>
        {loading &&
          <LoadingAnimation/>
        }
         
      {loading === false && ( 
          products.length != 0 ?(
           <ProductsTable products={products} error={error}/>
          ) : (
            <p className='error_message'>No product found.</p>
          )
        )} 
      </div>
    </div>
  );
};

const ProductsTable = ({products, error}) => {

  const columns = [
  {
    title: 'SKU',
    data: 'null', 
    render: (data, type, row) => (
      `<a 
      href="${row.page_url}" 
      target="_blank"
      class=" link-underline link-underline-opacity-0 link-underline-opacity-100-hover">
      ${row.sku}
      </a>`
    )
  },
  {
    title: 'Name',
    data: 'name'  // Correspond à la clé "name"
  },
  {
    title: 'Price',
    data: 'price'  // Correspond à la clé "price"
  },
  {
    title: 'In Stock',
    data: 'instock',  // Correspond à la clé "instock"
    render: (data) => (data ? 'Yes' : 'No')  // Convertir les booléens en texte lisible
  }];

  if (error) {
    return (
      <Container>
        <p>Erreur : {error}</p>
      </Container>
    );
  }
 return(   
  <DataTable 
  data={products}  
  className="display" 
  columns={columns}>
    </DataTable>
)};

const LoadingAnimation = () => {

  return(
    <div className='container'>
      <img src='/images/loading.gif' alt='loading...'/>
      <p>
        Riding through the Damco catalog...
      </p>
    </div>
  )
};

const FlaskLogo = () => {
  return(
    <div className='container-fluid text-center p-3'>
      <img className='img-fluid' src='/images/logo240px.png' alt='logo Flask Damco'/>
    </div> 
  )
};

const SearchForm = ({handleSubmit,}) => {
  
  const validationSchema = Yup.object({
    search: Yup.string()
    .required('Identifiant requis')
    .matches(/^\d{2}[-]?\d{3}[-]?\d{2}$/, 'Le format doit être 12-345-67 ou un format similaire'),
  });

  return(
    <Formik
        initialValues={{ search: '',}}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className='mb-3'>
              <FormGroup>
                <p>
                  <FormLabel htmlFor="search"> Type the product number in order to obtain its price and availability: </FormLabel>
                </p>
                <div>
                  <Field type="text" name="search" placeholder="12-345-67" size="28"/>
                  <StyledButton type="primary" $htmlType="submit" loading= {isSubmitting ? isSubmitting.toString() : undefined} $iconPosition="end" >
                    Search
                  </StyledButton>
                </div>
              <ErrorMessage name="search" component={Error} />
              </FormGroup>
            </Form>
          )}
        </Formik>
  )
};

export default ProductList;
