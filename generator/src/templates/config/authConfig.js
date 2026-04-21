import { PublicClientApplication } from "@azure/msal-browser";

//Need to move it to .env
const clientId = process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID;
const tenantName = "e0b26355-1889-40d8-8ef1-e559616befda";
const apiClientId = process.env.NEXT_PUBLIC_AZURE_API_CLIENT_ID;
const redirect_url = process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI;
console.log("redirect_url", redirect_url);
export const b2cPolicies = {
  authorities: {
    signUpSignIn: {
      authority: `https://login.microsoftonline.com/${tenantName}`,
    },
  },
  authorityDomain: `https://login.microsoftonline.com`,
};

export const msalConfig = {
  auth: {
    clientId: clientId, // This is the ONLY mandatory field that you need to supply.
    authority: b2cPolicies.authorities.signUpSignIn.authority, // Choose SUSI as your default authority.
    knownAuthorities: [b2cPolicies.authorityDomain], // Mark your B2C tenant's domain as trusted.
    redirectUri: redirect_url // You must register this URI on Azure Portal/App Registration. Defaults to window.location.origin
    // postLogoutRedirectUri: "https://fqc-dev.apps.oscshareddta.emirates.dev", // Indicates the page to navigate after logout.
    // navigateToLoginRequestUrl: false, // If "true", will navigate back to the original request location before processing the auth code response.
  },
  cache: {
    cacheLocation: "sessionStorage", // Configures cache location. "sessionStorage" is more secure, but "localStorage" gives you SSO between tabs.
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
};
export const loginRequest = {
  scopes: [ "User.Read"],
};

// API request - scope for calling the backend API
export const apiRequest = {
  scopes: [`api://${apiClientId}/Admin`],
};
export const msalInstance = new PublicClientApplication(msalConfig);

export async function initializeMSAL() {
  try {
    await msalInstance.initialize();
    console.log('MSAL initialized successfully');
  } catch (error) {
    console.error('MSAL initialization failed:', error);
  }
}


export const API_SCOPE_READ = `api://${apiClientId}/Admin`;