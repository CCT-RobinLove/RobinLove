import Head from "next/head";
import { useEffect, useState } from "react";
import Amplify, { API, PubSub } from "aws-amplify";
// import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { createClient } from "./_app";

// PubSub.subscribe('RobinAlarm').subscribe({
//     next: data => console.log('Message received', data),
//     error: error => console.error(error),
//     //@ts-ignore
//     close: () => console.log('Done'),
// });

//file system
// const fs = require("fs");

function Alert() {
    const [test, setTest] = useState("default test");

    useEffect(() => {
        console.log("Start useEffect");

        console.log("End useEffect");
    }, []);

    const addGmail = () => {
        API.post("alarms", "/alarms", {
            body: {
                mail_to: "mail1",
                mail_from: "mail2",
            },
        }).then((r) => {
            console.log("API addGmail finished");
            console.log(r);
        });

        // upload
        const uploadBody = {
            body: {
                email: "test2@fmail.com",
                fileName: "test.jpg",
                fileContent: "kfjdsklafjldsjfkldsjfioewjiorujeiwokj",
                lat: 2,
                long: 3,
            },
        };

        API.post("uploadz", "/uploadz", uploadBody).then((r) => {
            console.log("API uploadz finished");
            console.log(r);
        });
    };

    const listGmail = () => {
        API.get("alarms", "/alarms/mail1", {}).then((r) => {
            console.log("API listGmail finished");
            console.log(r);
        });

        API.get("uploadz", "/uploadz/mail1", {}).then((r) => {
            console.log("API uploadz finished");
            console.log(r);
        });
    };

    return (
        <div className=''>
            <Head>
                <title>RobinLove</title>
                <link rel='icon' href='/favicon.ico' />
            </Head>
            <h1>Alert Page</h1>
            <button onClick={addGmail}>{"addGmail"}</button>
            <button onClick={listGmail}>{"listGmail"}</button>
            <div>{test}</div>
        </div>
    );
}

export default Alert;
