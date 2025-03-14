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

const getProducts = async ( search, supplier) => {
    const response = await axios.get( `${supplier}-search?search=${search}&lang=${i18next.language}`);
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
                  const response = await getProducts(values.search,values.supplier);
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
          initialValues={{ search: '', supplier:'damco'}}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className='mb-3'>
                <FormGroup>
                  <p>
                    <FormLabel htmlFor="search"> <Trans i18nKey="SearchLabel"/></FormLabel>                   
                  </p>
                  <div >
                    <Field as="select" name="supplier" className="input-group-text rounded-end-0 border-end-0" style={{display: "inline",height:"38px"}}>
                      <option value="damco">Damco</option>
                      <option value="babac">Babac</option>
                    </Field>
                    <Field type="text" name="search" placeholder={i18next.t('searchInput.placeholder')} size="28" className="form-control rounded-0" style={{display: "inline", width:"262px"}}/>
                    <StyledButton type="primary" $htmlType="submit" disabled={loading|isSubmitting} $iconPosition="end" className="m-0 rounded-start-0" style={{display: "inline",height:"38px"}} >
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
  