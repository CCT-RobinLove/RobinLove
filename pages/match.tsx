import Link from "next/link";
import React, { useState } from "react";
import Header from "../components/Header";
import ImageUploader from "../components/ImageUploader";

const MOCK_MATCHES = [
  {
    avatar: "https://banner2.cleanpng.com/20180418/xqw/kisspng-avatar-computer-icons-business-business-woman-5ad736ba3f2735.7973320115240536902587.jpg",
    name: "Chomtana"
  },
  {
    avatar: "https://banner2.cleanpng.com/20180418/xqw/kisspng-avatar-computer-icons-business-business-woman-5ad736ba3f2735.7973320115240536902587.jpg",
    name: "Wasin Ong"
  },
  {
    avatar: "https://banner2.cleanpng.com/20180418/xqw/kisspng-avatar-computer-icons-business-business-woman-5ad736ba3f2735.7973320115240536902587.jpg",
    name: "สอนสัก"
  }
]

export default function Match(props) {
  const [matches, setMatches] = useState(MOCK_MATCHES);

  return (
    <div className="h-full">
      <Header></Header>

      <div className="p-4">
        <div className="text-3xl mb-4">Matches</div>

        <div className="flex flex-col w-full">
          {matches.map(match => 
            <Link href={"/call?email=" + match.name}>
              <div
                className="flex py-3 items-center cursor-pointer"
                style={{
                  borderBottom: "1px solid gray",
                }}
              >
                <img
                  src={match.avatar}
                  style={{
                    width: 64,
                    height: 64,
                    objectFit: "cover",
                    marginRight: 16,
                  }}
                ></img>
                <div className="text-lg flex-grow">{match.name}</div>
                <div className="text-xl">&gt;</div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
