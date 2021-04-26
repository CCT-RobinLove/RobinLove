import Head from "next/head";
import { useEffect, useState } from "react";
import Amplify, { API, PubSub, Storage } from "aws-amplify";
// import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { createClient } from "./_app";
import useInterval from "../src/useInterval";
import { updateLocation } from "../src/useUpdateLocation";

function Locate() {
    const [test, setTest] = useState("default test");
    const [client, setClient] = useState(null);

    useEffect(() => {
        console.log("Start useEffect");

        (async () => {
            setClient(await createClient());
        })();

        console.log("End useEffect");
    }, []);

    const getStorage = async () => {
        const res = await Storage.get("masketbeatz@gmail.com/profile.jpg");
        console.log(res);
    };

    return (
        <div className=''>
            <Head>
                <title>RobinLove</title>
                <link rel='icon' href='/favicon.ico' />
            </Head>
            <h1>Locate Page</h1>
            {/* <button onClick={test1}>{"test1"}</button> */}
            <hr />
            <button onClick={updateLocation}>{"updateLocation"}</button>
            <hr />
            <button onClick={() => console.log("client", client)}>
                {"client"}
            </button>
            <hr />
            <button onClick={getStorage}>{"getStorage"}</button>
        </div>
    );
}

export default Locate;
