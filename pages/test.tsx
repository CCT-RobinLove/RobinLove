import Head from "next/head";
import { useEffect, useState, useContext } from "react";
import Amplify, { API, PubSub, Storage } from "aws-amplify";
// import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { createClient } from "./_app";
import useInterval from "../src/useInterval";
import { updateLocation } from "../src/useUpdateLocation";
import { useRouter } from "next/router";
import EmailProvider from "../components/EmailProvider";

function Test() {
    const [test, setTest] = useState("default test");
    const [client, setClient] = useState(null);
    const { currentEmail } = useContext(EmailProvider);
    const router = useRouter();
    // (async () => {
    //     setClient(await createClient());
    // })();

    useEffect(() => {
        console.log("Start useEffect");

        console.log("End useEffect");
    }, []);

    return (
        <div className=''>
            <Head>
                <title>RobinLove</title>
                <link rel='icon' href='/favicon.ico' />
            </Head>
            <h1>Test Page</h1>
            <button
                onClick={async () => {
                    console.log("clicked");
                    console.log("currentEmail:", currentEmail);
                }}>
                {"currentEmail"}
            </button>
            <hr />
            <button
                onClick={async () => {
                    console.log("clicked");
                    const res = await API.del(
                        "alert2",
                        `/alert2/object/parinphatw@gmail.com/sronrasak@gmail.com`,
                        {}
                    );
                    console.log(res);
                }}>
                {"alert2 del parinphatw@gmail.com sronrasak@gmail.com"}
            </button>
            <hr />
            <button
                onClick={async () => {
                    console.log("clicked");
                    const res = await API.del(
                        "accept2",
                        `/accept2/object/nedrah1337@gmail.com`,
                        {}
                    );
                    console.log(res);
                }}>
                {"accept2 del nedrah1337@gmail.com"}
            </button>
            <hr />
            <button
                onClick={async () => {
                    console.log("clicked");
                    const res = await API.get(
                        "accept2",
                        `/accept2/nedrah133@gmail.com`,
                        {}
                    );
                    console.log(res);
                }}>
                {"accept2 nedrah133"}
            </button>
            <hr />
            <button
                onClick={() => {
                    router.push("/call?123@gmail.com");
                }}>
                {"go to calll"}
            </button>
            <hr />
            <button onClick={updateLocation}>{"updateLocation"}</button>
            <hr />
        </div>
    );
}

export default Test;
