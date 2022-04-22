import { createSlice } from "@reduxjs/toolkit";

export const productSlice = createSlice({
    name: "products",
    initialState: { value: { statestatus: [], flag: false } },
    reducers: {
        stateReducer: (state, { payload }) => {
            state.value.statestatus = payload;
        },
        favstateReducer: (state, { payload }) => {
            state.value.flag = payload
        }

    }
});

export const { stateReducer, favstateReducer } = productSlice.actions;
export default productSlice.reducer;