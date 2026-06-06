import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  rfqs: [],
  total: 0,
  selectedRfq: null,
  loading: false,
  error: null,
};

const rfqSlice = createSlice({
  name: 'rfq',
  initialState,
  reducers: {
    setRfqs(state, action) {
      state.rfqs = action.payload.rfqs;
      state.total = action.payload.total;
      state.loading = false;
    },
    setSelectedRfq(state, action) {
      state.selectedRfq = action.payload;
      state.loading = false;
    },
    addRfq(state, action) {
      state.rfqs.unshift(action.payload);
      state.total += 1;
    },
    updateRfqInList(state, action) {
      const index = state.rfqs.findIndex(r => r._id === action.payload._id);
      if (index !== -1) {
        state.rfqs[index] = action.payload;
      }
      if (state.selectedRfq?._id === action.payload._id) {
        state.selectedRfq = action.payload;
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

export const { setRfqs, setSelectedRfq, addRfq, updateRfqInList, setLoading, setError } = rfqSlice.actions;
export default rfqSlice.reducer;
