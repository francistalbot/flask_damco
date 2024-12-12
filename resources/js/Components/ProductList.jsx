import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Spin } from 'antd';
import styled from 'styled-components';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button, FormGroup, FormLabel } from 'react-bootstrap';

// Styled Components
const Container = styled.div`
`;

const Title = styled.h1`
  color: #333;
  text-align: center;
`;

const ProductListContainer = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const ProductItem = styled.li`
  background: #f9f9f9;
  margin: 10px 0;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ProductTitle = styled.h3`
  color: #1890ff;
  margin-bottom: 5px;
`;

const ProductBody = styled.p`
  color: #555;
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* Full screen height */
`;

const FormContainer = styled.div`
    margin: 20px 0;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;
const FieldGroup = styled.div`
    margin-bottom: 15px;

    label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
        color: #444;
    }

    input,
    textarea {
        width: 100%;
        padding: 10px;
        border-radius: 4px;
        border: 1px solid #ccc;
        font-size: 1rem;

        &:focus {
            outline: none;
            border-color: #007bff;
        }
    }

    textarea {
        resize: none;
        height: 80px;
    }
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
      //.get('https://jsonplaceholder.typicode.com/posts')
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
    else
      setLoading(false)
 }, [search]);

  

  if (error) {
    return (
      <Container>
        <p>Erreur : {error}</p>
      </Container>
    );
  }

  const handleSubmit = (values, { resetForm }) => {
        setLoading(true);
        setSearch(values.search);
        resetForm();
  };
  const validationSchema = Yup.object({
    search: Yup.string()
    .required('Identifiant requis')
    .matches(/^\d{2}[-]?\d{3}[-]?\d{2}$/, 'Le format doit être 12-345-67 ou un format similaire'),
  });
  return (
    <div>
      <h1>Search the Damco catalog </h1>
     <Formik
          initialValues={{ search: '',}}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
         {/**   */}{({ isSubmitting }) => (
          <Form>
            <FormGroup>
                <p>
                  <FormLabel for="search">Type the name of a part, or a product number, in order to obtain its price and availability: </FormLabel>
                </p>
              <div>
                <Field type="text" name="search" placeholder="12-345-67" size="28"/>
                <StyledButton type="primary" htmlType="submit" loading={isSubmitting} iconPosition="end" >
                  Search
                </StyledButton>
              </div>
              <ErrorMessage name="search" component={Error} />
            </FormGroup>
          </Form>
        )}
        </Formik>
      {loading &&
      <SpinnerContainer>
        <Spin size="large" />
      </SpinnerContainer>
      }
      {!loading && products.length != 0 &&
      <ProductListContainer>
        <table id="productTable" class="display">
         {/**  */} <thead>
            <tr>
              <th>Damco #</th>
              <th>Name</th>
              <th>Retail price</th>
              <th>In Stock?</th>
            </tr>
          </thead>
          <tbody>   
           {products.map((product) => (
              <tr>
                <td href={product.page_url}>{product.sku}</td>
                <td>{product.name}</td>
                <td>{product.price}</td>
                <td>{product.instock ? "Yes":"No"}</td>
              </tr>
            ))}
          </tbody>  
        </table>
      </ProductListContainer>
      }
    </div>
  );
};

export default ProductList;