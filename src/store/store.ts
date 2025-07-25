import { configureStore } from "@reduxjs/toolkit";

import propertyDetails from "./slices/propertyDetails";
import authentication from './slices/authSlice';
import listingReducer from './slices/listings';
import usersReducers from './slices/users';
import leadsReducers from './slices/leads';
import employeeReducer from './slices/employee'
import uploadReducer from './slices/uploadSlice';
import approvedReducer from './slices/approve_listings';
import { initializeAuthState } from "../utils/authutils";
import placesReducer from "./slices/places"
import adSlice from './slices/adSlice'
import notifySlice from './slices/notifySlice';
import packageSlice from './slices/packagesSlice';
import paymentSlice from './slices/paymentSlice';
import propertyDetailsByUserSlice from './slices/propertyDetailsbyUser';
import carrerSlice from './slices/careerSlice';
import shortsSlice from './slices/shortsSlice';
import locationsSlice from './slices/locationsSlice';
import employeeUsersSlice from './slices/employeeUsers';
import userEditSlice from './slices/userEditSlicet';
import userActivitySlice from './slices/user_activity';
import leadsReducer from "./slices/leadSlice"
import propertyLinksSlice from "./slices/propertyLinksSlice";
import legalsReducer from './slices/legals';
const preloadedState = {
    auth : initializeAuthState()
}

const store =  configureStore({
    reducer : {
        property:propertyDetails,
        auth:authentication,
        listings: listingReducer,
        users:usersReducers,
        employeeUsers:employeeUsersSlice,
        leads:leadsReducers,
        employee:employeeReducer,
        upload:uploadReducer,
        approved:approvedReducer,
        places:placesReducer,
        ads:adSlice,
        notify:notifySlice,
        package:packageSlice,
        payment:paymentSlice,
        propertyDetailsByUser:propertyDetailsByUserSlice,
        career:carrerSlice,
        shorts:shortsSlice,
        locations:locationsSlice,
        userEdit:userEditSlice,
        userActivity:userActivitySlice,
        liveLeads: leadsReducer,
        propertyLinks:propertyLinksSlice,
        legals: legalsReducer,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
    devTools: true
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

