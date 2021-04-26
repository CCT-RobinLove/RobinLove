import React from "react"
import Header from "../components/Header"

export default function Call(props) {
  return (
    <div className="h-full flex flex-col">
      <Header></Header>

      <div className="flex flex-col justify-around items-center flex-grow">
        <div>
          <img src={"https://banner2.cleanpng.com/20180418/xqw/kisspng-avatar-computer-icons-business-business-woman-5ad736ba3f2735.7973320115240536902587.jpg"} style={{
            width: 240,
            height: 240,
            borderRadius: "50%",
            objectFit: "cover",
          }}></img>
        </div>
  
        <div className="flex flex-row justify-around w-full">
          <div className="cursor-pointer">
            <img src="/accept.png" style={{width: 96, height: 96}}></img>
          </div>
  
          <div className="cursor-pointer">
            <img src="/reject.png" style={{width: 96, height: 96}}></img>
          </div>
        </div>
      </div>
    </div>
  )
}