import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  vendors: [],
  total: 0,
  selectedVendor: null,
  loading: false,
  error: null,
};

const vendorSlice = createSlice({
  name: 'vendor',
  initialState,
  reducers: {
    setVendors(state, action) {
      state.vendors = action.payload.vendors;
      state.total = action.payload.total;
      state.loading = false;
    },
    setSelectedVendor(state, action) {
      state.selectedVendor = action.payload;
      state.loading = false;
    },
    addVendor(state, action) {
      state.vendors.unshift(action.payload);
      state.total += 1;
    },
    updateVendorInList(state, action) {
      const index = state.vendors.findIndex(v => v._id === action.payload._id);
      if (index !== -1) {
        state.vendors[index] = action.payload;
      }
      if (state.selectedVendor?._id === action.payload._id) {
        state.selectedVendor = action.payload;
      }
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
      state.loading = false;
    }
  },
});

export const { setVendors, setSelectedVendor, addVendor, updateVendorInList, setLoading, setError } = vendorSlice.actions;
export default vendorSlice.reducer;
