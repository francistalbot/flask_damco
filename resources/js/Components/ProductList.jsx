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
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if(search.valueOf() != ('').valueOf())
      axios
      .get('damco-search?search=' + search)
      .then((response) => {
        setProducts(response.data.list_products);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
        setSearch('');
      });
 }, [search]);

  const handleSubmit = (values, { resetForm }) => {

    if(search.valueOf() != (values.search).valueOf())
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
        <SearchForm handleSubmit={handleSubmit} loading={loading}/>
        <img className='preload-image' src='/images/loading.gif' alt='loading...'/>
        {loading &&
          <LoadingAnimation/>
        }

      {search.valueOf() != ('').valueOf()
      && loading === false && (
        <SearchResult products={products} loading={loading} search={search} error={error} />
      )}
      </div>
    </div>
  );
};
const SearchResult = ({products,loading,search, error}) => {
  if (error) {
    return (
      <div className='container'>
        <p className='error_message'>Erreur : {error}</p>
      </div>
    );
  }
  
  const searchUrl = "c"+{search};
  if(products.length == 0) {
    return(
      <div className='container'>
      <p className='error_message'>No product found.</p>
      </div>
    );
  }

  if(products.length >= 0){
      return(  
    <div className='container'>
        {products.length === 120 ? (
          <p> Lots of items were found. Printing the first 120 items for <b>{search}</b> on Cycle Babac. More results can be inspected&#160; 
          <a href={`https://www.damourbicycle.com/search-damco?search=${encodeURIComponent(search)}`}>here</a>.
          </p>
        ) : (
          <p>{products.length} results found for <b>{search}</b> on Damco.</p>
        )}
        <p>You can click on the product number in order to access the product page on Damco website.</p>
        
        <ProductsTable products={products} error={error}/>
      </div>
      );
    }
  
    return (
      <div className='container'>
        <p className='error_message'>An error have occured</p>
      </div>
    );
  
}
const ProductsTable = ({products, error}) => {

  const columns = [
  {
    title: 'Damco #',
    data: 'sku',
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
    title: 'Retail Price',
    data: 'price',  // Correspond à la clé "price"
    render: (data) => (
        `${data}$`
    )
  },
  {
    title: 'In Stock?',
    data: 'instock',  // Correspond à la clé "instock"
    render: (data) => (data ? 'Yes' : 'No')  // Convertir les booléens en texte lisible
  }];
 return(
    <DataTable
    data={products}
  className="stripe table-hover table table-sm  no-footer"
    options={{
      paging: true,
      searching: false,
      ordering: true,
      initComplete: function (settings, json) {
        // Ajoute une classe spécifique à <thead>
        const table = settings.nTable; // Récupère la table
        const thead = table.querySelector('thead');
        if (thead) {
          thead.classList.add('thead-dark');
        }
      },
      rowCallback: function (row, data) {
        //Colore le text de la ligne en rouge ou vert selon la disponibilité du produit
        if (!data.instock) {
          row.classList.add("text-danger");
        } else {
          row.classList.add("text-success");
        }
      }
    }}
    columns={columns}/>
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

const SearchForm = ({handleSubmit, loading}) => {

  const validationSchema = Yup.object({
    search: Yup.string()
    .required('Identifiant requis')
    .matches(/[a-zA-Z0-9 ,-.\/\"]/, 'Ne peut pas contenir de caractères spéciaux')
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
                  <StyledButton type="primary" $htmlType="submit" disabled={loading} $iconPosition="end" >
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
