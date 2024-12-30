import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button, FormGroup, FormLabel } from 'react-bootstrap';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import { useTranslation ,Trans } from 'react-i18next';
import i18next from '../i18n'; 

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

  const { t, i18n } = useTranslation();
  return (
    <div>
      {products.length === 0 && (
        <FlaskLogo/>
      )}
      <div className='container-fluid text-center p-3'>
        <h1>
          <Trans i18nKey="welcome" /> 
        </h1>
        <SearchForm handleSubmit={handleSubmit} loading={loading} />
        <img className='preload-image' src='/images/loading.gif' alt='loading...'/>
        {loading &&
          <LoadingAnimation/>
        }

      {search.valueOf() != ('').valueOf()
      && loading === false && (
        <SearchResult products={products} search={search} error={error} />
      )}
      </div>
    </div>
  );
};

const SearchResult = ({products,search, error}) => {
  if (error) {
    return (
      <div className='container'>
        <p className='error_message'><Trans i18nKey="Error" values={{errorMessage : error}}/></p>
      </div>
    );
  }
  
  const searchUrl = `https://www.damourbicycle.com/search-damco?search=${encodeURIComponent(search)}`;
  //Output the suffixe for the SearchSummary name string depending on the number of products found
  const getSearchSummaryKey = (count) => {
    const keyMapping = {
      0: 'none',
      1: 'one',
      120: 'max',
    };
    return keyMapping[count] || 'many';
  }
  
  return(  
    <div className='container'>
      <p>
       <Trans i18nKey={"searchSummary."+getSearchSummaryKey(products.length)} 
          values={{search:search, searchUrl:searchUrl}}
          count={products.length}
          components={[ 
          <a href={searchUrl}/>,
          <span className="error_message"></span> ]}/>
      </p>
      {products.length > 0 && (
        <>
          <p>You can click on the product number in order to access the product page on Damco website.</p>
          <ProductsTable products={products}/>
        </>
      )}
      </div>
      );
  
}
const ProductsTable = ({products}) => {

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
    title: i18next.t('producTable.Name'),
    data: 'name'  // Correspond à la clé "name"
  },
  {
    title: i18next.t('producTable.RetailPrice'),
    data: 'price',  // Correspond à la clé "price"
    render: (data) => (
        `${data}$`
    )
  },
  {
    title: i18next.t('producTable.InStock?'),
    data: 'instock',  // Correspond à la clé "instock"
    render: (data) => (data ? i18next.t('Yes') : i18next.t('No'))  // Convertir les booléens en texte lisible
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
        <Trans i18nKey="Searching..."/>
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
    .required(i18next.t('searchInput.empty'))
    .matches(/[a-zA-Z0-9 ,-.\/\"]/, i18next.t('searchInput.invalid'))
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
                  <FormLabel htmlFor="search"> <Trans i18nKey="SearchLabel"/></FormLabel>
                </p>
                <div>
                  <Field type="text" name="search" placeholder={i18next.t('searchInput.placeholder')} size="28"/>
                  <StyledButton type="primary" $htmlType="submit" disabled={loading|isSubmitting} $iconPosition="end" >
                    <Trans i18nKey="Search"/>
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
