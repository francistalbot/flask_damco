import React from 'react';
import { Trans } from 'react-i18next';
import SearchResult from './SearchResult';
import SearchForm from './SearchForm';
const SearchContainer = () => {
    return (
      <div className='container-fluid text-center p-3'>
        <h1>
            <Trans i18nKey="welcome" /> 
        </h1>
        <SearchForm />
        <img className='preload-image' src='/images/loading.gif' alt='loading...'/>
        <SearchResult />
      </div>
    );
  };

export default SearchContainer;
      