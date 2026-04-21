"use client";
import { AccountInfo } from "@azure/msal-browser";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from "@azure/msal-react";
import { useEffect, useState } from "react";
import CustomAppBar from "../components/landingData/AppBar";
import SimpleBottomNavigation from "../components/landingData/SimpleBottomNavigation";
import LandingDetails from "../components/landingData/landingDetails";
import Head from "next/head";

const LandingPage = (props) => {
  const { instance, accounts } = useMsal();
  const [groupIds, setGroupIds] = useState([]);
  let activeAccount;
  console.log("LandingPage RENDER - accounts:", accounts?.length, "instance:", !!instance);

  if (instance) {
    console.log("Accounts ", accounts);
    activeAccount = accounts[0];
  } 

  useEffect(() => {
    console.log("Inside useEffect", activeAccount );
    if (activeAccount) {
      const groups = activeAccount?.idTokenClaims?.groups;
      console.log("Groups ", groups);
      if (groups) {
        setGroupIds(groups);
      } else {
        setGroupIds([]); // Ensure the state is cleared if groups are undefined or null
      }
    }
  }, [activeAccount]); // Dependency ensures this runs when activeAccount
  return (
    <div
      style={{
        backgroundColor: "white",
        minHeight: "100vh",
        color: "black",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Head>
        <title>RO APPS</title>
      </Head>
      <CustomAppBar user_name={activeAccount?.name} />
      {activeAccount && (
        <div style={{ padding: "20px", textAlign: "center" }}>
      <LandingDetails groupIds={groupIds} />
        </div>
      )}
      <SimpleBottomNavigation />
    </div>
  );
}
export default LandingPage;