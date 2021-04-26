import Head from "next/head";
import { useEffect, useState } from "react";
import Amplify, { API } from "aws-amplify";
import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { createClient } from "./_app";
import Header from "../components/Header";
import Link from "next/link";

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
        headers: {},
    };

    useEffect(() => {
        console.log("reeee");
        API.post("uploadApi", "/upload", payload).then((r) => {
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
        <div className='h-full'>
            <Head>
                <title>RobinLove</title>
                <link rel='icon' href='/favicon.ico' />
            </Head>
            
            <div className="flex flex-col h-full">
                <div>
                    <Header></Header>
                </div>
                <div className="flex-grow flex justify-center items-center">
                    <div>
                        <Link href="/upload">
                            <button className="bg-primary rounded text-white text-center p-2 text-lg" style={{width: 240}}>
                                Start Matching Now!
                            </button>
                        </Link>
                    </div>
                </div>
                <AmplifySignOut />
            </div>

        </div>
    );
}

export default withAuthenticator(Home);
