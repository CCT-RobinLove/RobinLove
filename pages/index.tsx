import Head from "next/head";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
    const [test, setTest] = useState("default test");
    useEffect(() => {
        axios
            .get("/test")
            .then((r) => setTest(r.data))
            .catch((e) => console.log(e, "reeeeeeee"));
    }, []);
    return (
        <div className="">
            <Head>
                <title>RobinLove</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            {test}
            I am RobinLove I am loving you
        </div>
    );
}
