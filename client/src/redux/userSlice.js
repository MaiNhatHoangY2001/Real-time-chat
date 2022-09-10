import { createSlice } from "@reduxjs/toolkit";


const userSlice = createSlice({
    name:"user",
    initialState:{
        sender:{
            user:null,
        },
        users:{
            allUsers: null,
            isFetching:false,
            error:false
        },
        msg:"",
    },
    reducers:{
        getUsersStart: (state)=>{
            state.users.isFetching = true;
        },
        getUsersSuccess: (state, action) => {
            state.users.isFetching = false;
            state.users.allUsers = action.payload;
        },
        getUsersFailed: (state) => {
            state.users.isFetching = false;
            state.users.error = true;
        },
        deleteUsersStart: (state)=>{
            state.users.isFetching = true;
        },
        deleteUsersSuccess: (state,action) => {
            state.users.isFetching = false;
            state.msg = action.payload;
        },
        deleteUsersFailed: (state, action) => {
            state.users.isFetching = false;
            state.users.error = true;
            state.msg = action.payload;
        },

        setSender: (state, action)=>{
            state.sender.user = action.payload;
        }
    }
})

export const {
    getUsersStart,
    getUsersSuccess,
    getUsersFailed,
    deleteUsersFailed,
    deleteUsersStart,
    deleteUsersSuccess,
    setSender
} = userSlice.actions;

export default userSlice.reducer;