import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    search: "",
    products: [],
    loading: false,
    error: null,
};

const searchSlice = createSlice({
    name: "search",
    initialState,
    reducers: {
        setSearch: (state, action) => {
            state.search = action.payload;
        },
        setProducts: (state, action) => {
            state.products = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
});

export const { setSearch, setProducts, setLoading, setError } =
    searchSlice.actions;

export default searchSlice.reducer;
