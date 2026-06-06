import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
  unreadCount: 0,
  sidebarOpen: true,
  loading: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    addNotification(state, action) {
      // Avoid duplicates
      const exists = state.notifications.some(n => n._id === action.payload._id);
      if (!exists) {
        state.notifications.unshift(action.payload);
        if (!action.payload.read) {
          state.unreadCount += 1;
        }
      }
    },
    setNotifications(state, action) {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.read).length;
    },
    markNotificationRead(state, action) {
      const index = state.notifications.findIndex(n => n._id === action.payload);
      if (index !== -1 && !state.notifications[index].read) {
        state.notifications[index].read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action) {
      state.sidebarOpen = action.payload;
    },
    setGlobalLoading(state, action) {
      state.loading = action.payload;
    }
  },
});

export const { addNotification, setNotifications, markNotificationRead, toggleSidebar, setSidebarOpen, setGlobalLoading } = uiSlice.actions;
export default uiSlice.reducer;
