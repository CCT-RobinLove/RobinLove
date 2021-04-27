import { useRouter } from "next/router";
import React, { useState, useEffect, useContext } from "react";
import Amplify, { API } from "aws-amplify";
import Header from "../components/Header";
import EmailProvider from "../components/EmailProvider";
import { useAcceptPoll, useAlertPoll } from "../src/usePolling";

export default function Matching(props) {
    const router = useRouter();
    const bucket =
        "https://upload2-s3150527-devtokyo.s3-ap-northeast-1.amazonaws.com";

    const [mail_to, setMail_to] = useState("");
    const [mail_from, setMail_from] = useState("");

    const { currentEmail, setCurrentEmail } = useContext(EmailProvider);

    useEffect(() => {
        if (!router.query.mail_to || !router.query.mail_from) return;

        //@ts-ignore
        setMail_to(router.query.mail_to);
        //@ts-ignore
        setMail_from(router.query.mail_from);

        API.post("alert2", "/alert2", {
            body: {
                mail_to: router.query.mail_to,
                mail_from: router.query.mail_from,
            },
        }).catch((e) => console.log(e));
    }, [router.query.mail_to, router.query.mail_from]);

    useAcceptPoll(currentEmail);

    return (
        <div className='h-full flex flex-col'>
            <Header></Header>

            <div className='flex flex-col justify-around items-center flex-grow'>
                <div>
                    <img
                        src={`${bucket}/${mail_to}/profile.jpg`}
                        style={{
                            width: 240,
                            height: 240,
                            borderRadius: "50%",
                            objectFit: "cover",
                        }}></img>
                </div>

                <div className='flex flex-row justify-around w-full pb-12'>
                    <div className='text-4xl'>Matching</div>
                </div>
            </div>
        </div>
    );
}
