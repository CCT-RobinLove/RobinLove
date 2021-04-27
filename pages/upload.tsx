import React, { useEffect, useState, useContext } from "react";
import Header from "../components/Header";
import ImageUploader from "../components/ImageUploader";
import Link from "next/link";
import Amplify, { API, Auth } from "aws-amplify";
import { useAcceptPoll, useAlertPoll } from "../src/usePolling";
import EmailProvider from "../components/EmailProvider";

export default function Upload(props) {
    const { currentEmail, setCurrentEmail } = useContext(EmailProvider);

    useEffect(() => {
        (async () => {
            const {
                attributes: { email },
            } = await Auth.currentAuthenticatedUser();
            setCurrentEmail(email);
            console.log("finish setCurrentEmail", email);
        })();
    }, []);

    // useAcceptPoll(currentEmail);
    // useAlertPoll(currentEmail);

    return (
        <div className='h-full'>
            <Header></Header>

            <div
                className='flex flex-col justify-center items-center w-full'
                id='avatar-uploader'
                style={{ height: "calc(100% - 60px)" }}>
                <div className='mb-3'>
                    <ImageUploader></ImageUploader>
                </div>

                <Link href='/match'>
                    <button
                        className='bg-primary rounded text-white text-center p-2 text-lg'
                        style={{ width: 240 }}>
                        Continue
                    </button>
                </Link>
            </div>
        </div>
    );
}
