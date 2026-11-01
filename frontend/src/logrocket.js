import LogRocket from "logrocket";

const appId = import.meta.env.VITE_LOGROCKET_APP_ID;

if (appId && import.meta.env.PROD) {
  LogRocket.init(appId);
}