import Head from "next/head";
import React from "react";
import "tailwindcss/tailwind.css";
import "../styles/globals.css";
import Amplify, { API, Auth } from "aws-amplify";
import awsconfig from "../src/aws-exports";
import Location from "aws-sdk/clients/location";
import 'antd/dist/antd.css';

Amplify.configure(awsconfig);

const createClient = async () => {
    const credentials = await Auth.currentCredentials();
    const client = new Location({
        credentials,
        region: awsconfig.aws_project_region,
    });
    return client;
};

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
export { createClient };
