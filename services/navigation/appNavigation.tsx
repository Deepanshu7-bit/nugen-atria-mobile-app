let openNotificationsHandler = null;
let openProfileHandler = null;
let goBackHandler = null;
let openTabHandler = null;
let pendingHotelDetailId = null;

export const registerOpenNotificationsHandler = (handler) => {
  openNotificationsHandler = typeof handler === "function" ? handler : null;

  return () => {
    if (openNotificationsHandler === handler) {
      openNotificationsHandler = null;
    }
  };
};

export const openNotificationsScreen = () => {
  if (typeof openNotificationsHandler === "function") {
    openNotificationsHandler();
  }
};

export const registerOpenProfileHandler = (handler) => {
  openProfileHandler = typeof handler === "function" ? handler : null;

  return () => {
    if (openProfileHandler === handler) {
      openProfileHandler = null;
    }
  };
};

export const openProfileScreen = () => {
  if (typeof openProfileHandler === "function") {
    openProfileHandler();
  }
};

export const registerGoBackHandler = (handler) => {
  goBackHandler = typeof handler === "function" ? handler : null;

  return () => {
    if (goBackHandler === handler) {
      goBackHandler = null;
    }
  };
};

export const navigateBack = () => {
  if (typeof goBackHandler === "function") {
    goBackHandler();
  }
};

export const registerOpenTabHandler = (handler) => {
  openTabHandler = typeof handler === "function" ? handler : null;

  return () => {
    if (openTabHandler === handler) {
      openTabHandler = null;
    }
  };
};

export const openTabScreen = (tabKey) => {
  if (typeof openTabHandler === "function") {
    openTabHandler(tabKey);
  }
};

export const openHotelDetailScreen = (hotelId) => {
  pendingHotelDetailId = hotelId ? String(hotelId) : null;
  openTabScreen("hotels");
};

export const consumePendingHotelDetailId = () => {
  const id = pendingHotelDetailId;
  pendingHotelDetailId = null;
  return id;
};
