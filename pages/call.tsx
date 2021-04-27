import React, { useEffect, useState } from "react";
import Amplify, { API, Auth } from "aws-amplify";
import Header from "../components/Header";
import { useRouter } from "next/router";

export default function Call(props) {
    const router = useRouter();
    const [mail_to, setMail_to] = useState(router.query.mail_to || "");
    const [mail_from, setMail_from] = useState(router.query.mail_from || "");
    // console.log("query:", router.query);
    // console.log("mail to:", mail_to);
    // console.log("mail from:", mail_from);

    useEffect(() => {
        setMail_to(router.query.mail_to);
        setMail_from(router.query.mail_from);
    }, [router.query.mail_to, router.query.mail_from]);

    const bucket =
        "https://upload2-s3150527-devtokyo.s3-ap-northeast-1.amazonaws.com";

    const mockImg =
        "https://banner2.cleanpng.com/20180418/xqw/kisspng-avatar-computer-icons-business-business-woman-5ad736ba3f2735.7973320115240536902587.jpg";

    const endAlert = async () => {
        const res = await API.del(
            "alert2",
            `/alert2/object/${mail_to}/${mail_from}`,
            {}
        ).catch((e) => console.log("endAlert Failed", e));

        console.log("endAlert Finish", res);
    };

    const acceptCalls = async () => {
        await API.post("accept2", "/accept2", {
            body: {
                subject: "Match Found! Wish you 2 have good days",
                acceptor_email: mail_to,
                acceptee_email: mail_from,
                message: `${mail_from} and ${mail_to} have been matched with one another. Don't miss your chance!`,
                status: 1,
            },
        });

        router.push(`/matched?mail_from=${mail_from}&mail_to=${mail_to}`);
    };

    const rejectCalls = async () => {
        await API.post("accept2", "/accept2", {
            body: {
                subject: "No match ja",
                acceptor_email: mail_to,
                acceptee_email: mail_from,
                message: "Not match naja",
                status: 0,
            },
        });

        router.push("/match");
    };

    useEffect(() => {
        endAlert();
    }, []);

    return (
        <div className='h-full flex flex-col'>
            <Header></Header>

            <div className='flex flex-col justify-around items-center flex-grow'>
                <div>
                    <img
                        src={`${bucket}/${mail_from}/profile.jpg`}
                        style={{
                            width: 240,
                            height: 240,
                            borderRadius: "50%",
                            objectFit: "cover",
                        }}></img>
                </div>

                <div className='flex flex-row justify-around w-full'>
                    <div className='cursor-pointer' onClick={acceptCalls}>
                        <img
                            src='/accept.png'
                            style={{ width: 96, height: 96 }}></img>
                    </div>

                    <div className='cursor-pointer' onClick={rejectCalls}>
                        <img
                            src='/reject.png'
                            style={{ width: 96, height: 96 }}></img>
                    </div>
                </div>
            </div>
        </div>
    );
}
