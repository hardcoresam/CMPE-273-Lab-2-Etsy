import { createSlice } from "@reduxjs/toolkit";

export const registerSlice = createSlice({
    name: "register",
    initialState: {
        value: {
            isLoading: false,
            isAuth: false,
            error: ''
        }
    },
    reducers: {
        registerPending: (state) => {
            state.value.isLoading = true;
        },
        registerSuccess: (state) => {
            state.value.isLoading = false;
            state.value.isAuth = true;
            state.value.error = "";
        },
        registerFail: (state, { payload }) => {
            state.value.isLoading = false;
            state.value.error = payload;
        }
    }
});

export const { registerPending, registerSuccess, registerFail } = registerSlice.actions;
export default registerSlice.reducer;