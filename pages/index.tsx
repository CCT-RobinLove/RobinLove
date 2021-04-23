import Head from "next/head";
import { useEffect, useState } from "react";
import Amplify, { API } from "aws-amplify";
import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { createClient } from "./_app";

const path = require("path");

function Home() {
    const [test, setTest] = useState("default test");
    const params = {
        IndexName: "index1",
        Text: "Indianapolis",
    };

    // To delete later...
    const filepath = path.resolve("public", "test.jpg");
    const payload = {
        body: {
            email: "test@fmail.com",
            filepath: filepath,
        },
    };

    useEffect(() => {
        console.log("reeee");
        API.get("uploadApi", "/upload", payload).then((r) => {
            console.log("API Called finished 2");
            console.log(r);
        });

        createClient().then((client) =>
            client.searchPlaceIndexForText(params, (err, data) => {
                console.log("finish search place index");
                if (err) console.error(err);
                if (data) console.log(data);
            })
        );
    }, []);
    return (
        <div className=''>
            <Head>
                <title>RobinLove</title>
                <link rel='icon' href='/favicon.ico' />
            </Head>
            <AmplifySignOut />
            <div>{test}</div>
            <div>I am RobinLove I am loving you</div>
        </div>
    );
}

export default withAuthenticator(Home);
