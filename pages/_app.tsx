import Head from "next/head";
import React from "react";
import "tailwindcss/tailwind.css";
import "../styles/globals.css";
import Amplify, { API } from "aws-amplify";
// import awsconfig from "../src/aws-exports";

// Amplify.configure(awsconfig);

function MyApp({ Component, pageProps }) {
    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>
            <Component {...pageProps} />
        </>
    );
}

export default MyApp;
