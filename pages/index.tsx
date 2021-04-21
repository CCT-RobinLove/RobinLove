import Head from "next/head";
import { useEffect, useState } from "react";
// import axios from "axios";
import Amplify, { API } from "aws-amplify";
import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";

function Home() {
    const [test, setTest] = useState("default test");
    useEffect(() => {
        console.log("reeee");
        API.get("test", "/test", {}).then((r) => {
            console.log("asdasdasdasd");
            console.log(r);
        });
    }, []);
    return (
        <div className="">
            <Head>
                <title>RobinLove</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <AmplifySignOut />
            <div>{test}</div>
            <div>I am RobinLove I am loving you</div>
        </div>
    );
}

export default withAuthenticator(Home);
