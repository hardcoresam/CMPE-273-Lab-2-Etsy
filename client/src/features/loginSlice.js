import { createSlice } from "@reduxjs/toolkit";

export const loginSlice = createSlice({
    name: "login",
    initialState: {
        value: {
            isLoading: false,
            isAuth: false,
            error: ''
        }
    },
    reducers: {
        loginPending: (state) => {
            state.value.isLoading = true;
        },
        loginSuccess: (state) => {
            state.value.isLoading = false;
            state.value.isAuth = true;
            state.value.error = "";
        },
        loginFail: (state, { payload }) => {
            state.value.isLoading = false;
            state.value.error = payload;
        }
    }
});

export const { loginPending, loginSuccess, loginFail } = loginSlice.actions;
export default loginSlice.reducer;