import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js';
import vendorReducer from './vendorSlice.js';
import rfqReducer from './rfqSlice.js';
import uiReducer from './uiSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    vendor: vendorReducer,
    rfq: rfqReducer,
    ui: uiReducer,
  },
});
