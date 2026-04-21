// import "../styles/globals.css";
// import SessionTimeoutHandler from "../components/SessionTimeoutHandler";
import {

  EventType,
  PublicClientApplication,
} from "@azure/msal-browser";
import { msalConfig } from "../config/authConfig";
import { MsalProvider } from "@azure/msal-react";
import Head from "next/head";

export const msalInstance = new PublicClientApplication(msalConfig);

if (
  !msalInstance.getActiveAccount() &&
  msalInstance.getAllAccounts().length > 0
) {
  msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
}

msalInstance.addEventCallback((event) => {
  if (
    (event.eventType === EventType.LOGIN_SUCCESS ||
      event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS ||
      event.eventType === EventType.SSO_SILENT_SUCCESS) &&
    event.payload
  ) {
    // @ts-ignore
    msalInstance.setActiveAccount(event.payload.account);
  } else if (event.eventType === EventType.ERROR) {
    console.error("MSAL Error:", event.error);
  }
});

export default function App({ Component, pageProps }) {
  return (
    <>
    <Head>
      <link rel="icon" href="/ek.ico" />
    </Head>
    <MsalProvider instance={msalInstance}>
      {/* <SessionTimeoutHandler timeoutMinutes={1} /> */}
      <Component {...pageProps} />
    </MsalProvider>
    </>
  );
}
