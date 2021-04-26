import Head from "next/head";
import React from "react";
import "tailwindcss/tailwind.css";
import "../styles/globals.css";
import Amplify, { API, Auth, PubSub, Storage } from "aws-amplify";
import { AWSIoTProvider } from "@aws-amplify/pubsub";
import awsconfig from "../src/aws-exports";
import Location from "aws-sdk/clients/location";
import useUpdateLocation from "../src/useUpdateLocation";
import "antd/dist/antd.css";

// global.WebSocket = require('ws');
// Amplify.addPluggable(
//     new AWSIoTProvider({
//         aws_pubsub_region: "ap-northeast-1",
//         aws_pubsub_endpoint: "wss://a28y3sxx48nq4o.iot.ap-northeast-1.amazonaws.com/mqtt",
//     })
// );

Amplify.configure(awsconfig);
// Amplify.register(Auth);
// Amplify.register(API);

if (process.browser) {
    Auth.currentCredentials().then((creds) => {
        console.log(`creds`, creds);
        // const cognitoIdentityId = info.IdentityId;
    });

    Auth.currentAuthenticatedUser().then((user) => {
        console.log(`user`, user);
        // const email = user.attributes.email;
    });

    Auth.currentSession().then((session) => {
        console.log(`session`, session);
    });
}

const createClient = async () => {
    const credentials = await Auth.currentCredentials();
    const client = new Location({
        credentials,
        region: awsconfig.aws_project_region,
    });
    return client;
};

function MyApp({ Component, pageProps }) {
    useUpdateLocation();
    return (
        <>
            <Head>
                <meta
                    name='viewport'
                    content='width=device-width, initial-scale=1.0'
                />
            </Head>
            <Component {...pageProps} />
        </>
    );
}

export default MyApp;
export { createClient };
