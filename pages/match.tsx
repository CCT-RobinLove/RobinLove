import React from "react";
import Header from "../components/Header";
import ImageUploader from "../components/ImageUploader";

export default function Match(props) {
  return (
    <div className="h-full">
      <Header></Header>

      <div className="p-4">
        <div className="text-3xl mb-4">Matches</div>

        <div className="flex flex-col w-full">
          <div
            className="flex py-3 items-center"
            style={{
              borderBottom: "1px solid gray",
            }}
          >
            <img
              src="https://banner2.cleanpng.com/20180418/xqw/kisspng-avatar-computer-icons-business-business-woman-5ad736ba3f2735.7973320115240536902587.jpg"
              style={{
                width: 32,
                height: 32,
                objectFit: "cover",
                marginRight: 16,
              }}
            ></img>
            <div className="text-lg">Chomtana</div>
          </div>
        </div>
      </div>
    </div>
  );
}
