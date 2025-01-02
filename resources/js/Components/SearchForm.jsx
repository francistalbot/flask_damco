import React from 'react';
import { Trans } from 'react-i18next';
import i18next from '../i18n'; 
import styled from 'styled-components';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FormGroup, FormLabel } from 'react-bootstrap';
import { useDispatch, useSelector } from "react-redux";
import { setSearch, setProducts, setLoading, setError } from "../redux/searchSlice";
import axios from 'axios';

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

const getProducts = async (search) => {
    const response = await axios.get('damco-search?search=' + search 
        + '&lang='+ i18next.language);
    return response.data;
};
export const SearchForm = () => {
    const dispatch = useDispatch();
    const { search, loading } = useSelector((state) => state.search);

    const handleSubmit = (values, { resetForm, setSubmitting, setErrors}) => {
        const searchProducts = async () => {
            try {
                    dispatch(setSearch(values.search));
                    dispatch(setLoading(true));
                    const response = await getProducts(values.search); 
                    dispatch(setProducts(response.list_products));
                } catch (err) {
                  dispatch(setError(err));
                  setErrors({ general: err });
                } finally {
                  dispatch(setLoading(false));
                }}
        searchProducts();
        resetForm();
        setSubmitting(false);
    };

    const validationSchema = Yup.object({
      search: Yup.string()
      .required(i18next.t('searchInput.empty'))
      .matches(/[a-zA-Z0-9 ,-.\/\"]/, i18next.t('searchInput.invalid'))
    });
  
    return(
        <>
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
        </>
    )
  };
  export default SearchForm;
  