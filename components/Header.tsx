import React from "react"

export default function Header() {
  return (
    <div className="flex flex-row items-center bg-primary w-full">
      <div className="text-3xl text-white px-3" onClick={() => window.history.back()}>
        ⇦
      </div>

      <div className="text-center text-3xl text-white p-3 pr-12 flex-grow">
        RobinLove
      </div>
    </div>
  )
}