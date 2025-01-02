import React from 'react';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import {Trans } from 'react-i18next';
import {useSelector } from "react-redux";
import i18next from '../i18n'; 
import { Container } from 'react-bootstrap';
DataTable.use(DT);

export const SearchResult = () => {
  const { search, products , loading, error } = useSelector((state) => state.search);

    if (error) 
      return (
        <Container>
          <p className='error_message'><Trans i18nKey="Error" values={{errorMessage : error}}/></p>
        </Container>
      );
    
    if (loading)
      return(
        <Container>
          <img src='/images/loading.gif' alt='loading...'/>
          <p>
            <Trans i18nKey="Searching..."/>
          </p>
        </Container>
      )
    
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
    if (search)
      return(  
        <Container>
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
              <p><Trans i18nKey={"searchSummary.instruction"} /></p>
              <ProductsTable products={products}/>
            </>
          )}
          </Container>
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

  export default SearchResult;

