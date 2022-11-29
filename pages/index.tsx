import Head from "next/head";
import Image from "next/image";
import io from "socket.io-client";
import { useEffect, useState } from "react";
const {
    uniqueNamesGenerator,
    adjectives,
    colors,
    animals,
} = require("unique-names-generator");
const randomName = uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
});

fetch('http://localhost:3000/api/ws')
const socket = io()

export default function Home() {
    const [messages, setMessages]: any = useState([]);
    const [nickname, setNickname] = useState(randomName);
    const [inputText, setInputText] = useState("");
    const [whoIsTyping, setWhoIsTyping] = useState("");

    useEffect(() => {
        socket.on("connect", () => {
            console.log("connect");
        });
        socket.on("disconnect", () => {
            console.log("disconnect");
        });
        socket.on("message", (val) => {
            setWhoIsTyping("");
            setMessages([...messages, val]);
        });

        socket.on("typing", (val) => {
            if (val != nickname) setWhoIsTyping(`${val} is typing...`);
        });

        socket.on("stop-typing", () => {
            setWhoIsTyping("");
        });

        return () => {
            socket.off("connect");
            socket.off("disconnect");
            socket.off("message");
            socket.off("typing");
        };
    });

    // function emit message
    const sendMessage = (e: any) => {
        e.preventDefault();
        socket.emit("message", {
            from: nickname,
            message: inputText,
        });
        socket.emit("stop-typing", nickname);
        setInputText("");
    };
    return (
        <>
            <Head>
                <title>FDCoord - Chat app</title>
                <meta name="description" content="FDCoord - Chat App" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="bg-zinc-800 w-screen h-screen">
                {/* header */}
                <header id="topNavGroupName">
                    <div className="flex fixed top-0 flex-col pt-1 m-0 w-screen md:h-18 h-26 mb-26 md:mb-18 shadow-lg bg-zinc-900">
                        <div className="ml-24 lg:ml-28">
                            <p className="text-lg font-bold text-white">FDCood | {whoIsTyping}</p>
                            <label className="label">Your Nickname: </label>
                            <input
                                type="text"
                                className="bg-zinc-600 mx-2 my-2 rounded-sm outline-none py-1 text-center"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                            />
                        </div>
                    </div>
                </header>
                <div className="rounded p-2 scroll bg-zinc-800 pb-16 pt-32 flex-row">
                    {/* message content */}
                    {messages.map((e: any, index: any) => (
                        <div
                            className={
                                e.from == nickname
                                    ? "p-2 text-end border rounded mb-2 w-auto"
                                    : "p-2 text-start border rounded mb-2 w-auto"
                            }
                            key={index}
                        >
                            <p>
                                <strong>{e.from == nickname ? "You" : e.from}</strong>{" "}
                                <br></br>
                                {e.message}
                                <br></br>
                                {e.date}
                            </p>
                        </div>
                    ))}
                    {/* input text */}
                </div>
                <div id="chatBar">
                    <form onSubmit={sendMessage}>
                        <div className="flex fixed bottom-1 right-1 rounded-lg">
                            <input id="messageBox" type="text" className="flex outline-none border-none px-3 md:w-[192vh] w-[38vh] text-white bg-zinc-900" size={50}
                                placeholder="Message ${group.Name}" // ={sendMessage}
                                required
                                value={inputText}
                                onChange={(e) => {
                                    socket.emit("typing", nickname);
                                    setInputText(e.target.value);
                                }}
                                onKeyUp={(e) => {
                                    setTimeout(() => {
                                        socket.emit("stop-typing", nickname);
                                        setWhoIsTyping("");
                                    }, 4000);
                                }}
                            />
                            <span className="p-2 text-3xl border-r-4 bg-zinc-700 border-zinc-700">
                                <svg onClick={sendMessage} className="block w-7 h-7 rounded-xl bottom-0 cursor-pointer bg-white hover:bg-white"
                                    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
                                </svg>
                            </span>
                        </div>
                    </form>
                </div>
            </main>
        </>
    )
}