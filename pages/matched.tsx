import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { useRouter } from "next/router";

export default function Matched(props) {
    const router = useRouter();
    const [mail_from, setMail_from] = useState("");

    useEffect(() => {
        //@ts-ignore
        setMail_from(router.query.mail_from);
    }, [router.query.mail_from]);

    const bucket =
        "https://upload2-s3150527-devtokyo.s3-ap-northeast-1.amazonaws.com";

    const mockImg =
        "https://banner2.cleanpng.com/20180418/xqw/kisspng-avatar-computer-icons-business-business-woman-5ad736ba3f2735.7973320115240536902587.jpg";

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

                <div className='flex flex-row justify-around w-full pb-12'>
                    <div className='text-4xl'>Matched</div>
                </div>
            </div>
        </div>
    );
}
