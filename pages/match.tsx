import React, { useState, useEffect, useContext } from "react";
import Header from "../components/Header";
import ImageUploader from "../components/ImageUploader";
import { Spin } from "antd";
import Amplify, { API, Auth } from "aws-amplify";
import { useRouter } from "next/router";
import EmailProvider from "../components/EmailProvider";
import { useAcceptPoll, useAlertPoll } from "../src/usePolling";

const MOCK_MATCHES = [
    {
        avatar:
            "https://banner2.cleanpng.com/20180418/xqw/kisspng-avatar-computer-icons-business-business-woman-5ad736ba3f2735.7973320115240536902587.jpg",
        name: "Chomtana",
    },
    {
        avatar:
            "https://banner2.cleanpng.com/20180418/xqw/kisspng-avatar-computer-icons-business-business-woman-5ad736ba3f2735.7973320115240536902587.jpg",
        name: "Wasin Ong",
    },
    {
        avatar:
            "https://banner2.cleanpng.com/20180418/xqw/kisspng-avatar-computer-icons-business-business-woman-5ad736ba3f2735.7973320115240536902587.jpg",
        name: "สอนสัก",
    },
];

export default function Match(props) {
    // const [matches, setMatches] = useState(MOCK_MATCHES);
    const router = useRouter();
    const [matches, setMatches] = useState(MOCK_MATCHES);
    const [isLoading, setIsLoading] = useState(true);
    const { currentEmail, setCurrentEmail } = useContext(EmailProvider);

    useAlertPoll(currentEmail);

    useEffect(() => {
        const bucket =
            "https://upload2-s3150527-devtokyo.s3-ap-northeast-1.amazonaws.com";
        console.log("start useEffect");
        API.get("upload2", "/upload2", {}).then(async (res) => {
            const { Items } = res.data;

            console.log("Owner Email:", currentEmail);

            const filteredItems = Items.filter(({ email, lat, long }) => {
                return email !== currentEmail;
            });
            const parsedItems = filteredItems.map(({ email, lat, long }) => ({
                avatar: `${bucket}/${email}/profile.jpg`,
                name: email,
            }));

            setMatches(parsedItems);
            setIsLoading(false);
            console.log("Finish scan");
            console.log(res);
        });
        console.log("end useEffect");
    }, []);

    const doMatches = async (match) => {
        const toMatchEmail = match.name;

        router.push(
            `/matching?mail_to=${toMatchEmail}&mail_from=${currentEmail}`
        );
    };

    if (isLoading)
        return (
            <>
                <Header />
                <div className='w-full text-center pt-16'>
                    <Spin />
                </div>
            </>
        );

    return (
        <div className='h-full'>
            <Header></Header>

            <div className='p-4'>
                <div className='text-3xl mb-4'>Matches</div>

                <div className='flex flex-col w-full'>
                    {matches.map((match) => (
                        <div
                            key={match.name}
                            className='flex py-3 items-center'
                            style={{
                                borderBottom: "1px solid gray",
                            }}>
                            <img
                                src={match.avatar}
                                style={{
                                    width: 32,
                                    height: 32,
                                    objectFit: "cover",
                                    marginRight: 16,
                                }}></img>
                            <div className='text-lg flex-grow'>
                                {match.name}
                            </div>
                            <div
                                className='text-xl cursor-pointer'
                                onClick={() => doMatches(match)}>
                                &gt;
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
