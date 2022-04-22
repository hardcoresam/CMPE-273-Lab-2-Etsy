import { createSlice } from "@reduxjs/toolkit";

export const logoutSlice = createSlice({
    name: "logout",
    initialState: {
        value: {
            isLoading: false,
            isAuth: false,
            error: ''
        }
    },
    reducers: {
        logoutPending: (state) => {
            state.value.isLoading = true;
        },
        logoutSuccess: (state) => {
            state.value.isLoading = false;
            state.value.isAuth = true;
            state.value.error = "";
        }
    }
});

export const { logoutPending, logoutSuccess } = logoutSlice.actions;
export default logoutSlice.reducer;