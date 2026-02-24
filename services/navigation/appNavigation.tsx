let openNotificationsHandler = null;
let openProfileHandler = null;

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
