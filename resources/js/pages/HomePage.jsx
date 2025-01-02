import React from "react";
import Banner from "../Components/Banner";
import SearchContainer from "../Components/SearchContainer";
import { useTranslation  } from 'react-i18next';

const HomePage = () => {
  const { t, i18n } = useTranslation();
    return (
        <>
            <Banner/>
            <SearchContainer/>
        </>
    )}

    export default HomePage;
    