import Head from "next/head";
import {

  AuthenticatedTemplate,
  useMsal,

} from "@azure/msal-react";

import AuthLayout, { isAdmin } from "../components/wrapper/ContentWrapper";
import LandingPage from "./landing";



export default function Home() {
  const { instance, accounts } = useMsal();
  let activeAccount;

  if (instance) {
    activeAccount = accounts[0];
  }

  return (
    <>
      <AuthLayout>
        <AuthenticatedTemplate>
          <Head>
            <title>RO APPS - CDS</title>
          </Head>
          <AuthLayout>
            <AuthenticatedTemplate>
              <LandingPage name="landing"></LandingPage>
            </AuthenticatedTemplate>
          </AuthLayout>
        </AuthenticatedTemplate>

      </AuthLayout>
    </>
  );
}
