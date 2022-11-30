import Head from "next/head";
import io from "socket.io-client";
import { useEffect, useState } from "react";
const {
    uniqueNamesGenerator,
    starWars,

} = require("unique-names-generator");
const randomName = uniqueNamesGenerator({
    dictionaries: [starWars],
});
const urlRegex = /(http|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/g

fetch('http://localhost:3000/api/ws')
const socket = io()

export default function Home() {
    const [messages, setMessages]: any = useState([]);
    const [nickname, setNickname] = useState(randomName);
    const [inputText, setInputText] = useState("");
    const [whoIsTyping, setWhoIsTyping] = useState("");

    useEffect(() => {
        socket.on("connect", () => {
            console.info("connected");
        });
        socket.on("disconnect", () => {
            console.info("disconnect");
        });
        socket.on("message", (val) => {
            setWhoIsTyping("");
            setMessages([...messages, val])
        });
        socket.on("newUser", (val) => {
            setMessages([...messages, val])
        });
        socket.on("typing", (val) => {
            if (val != nickname) setWhoIsTyping(`| ${val} is typing...`);
        });
        socket.on("stop-typing", () => {
            setWhoIsTyping("");
        });
        return () => {
            socket.off("connect");
            socket.off("disconnect");
            socket.off("message");
            socket.off("typing");
            socket.off("newUser")
        };
    });
    // generate ID
    function gen(length: number) {
        let result = [];
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result.push(characters.charAt(Math.floor(Math.random() *
                charactersLength)));
        }
        return result.join('');
    }

    // function emit message
    const sendMessage = (e: any) => {
        e.preventDefault();
        if (!inputText) return
        socket.emit("message", {
            from: nickname,
            message: inputText,
            id: gen(16)
        });
        socket.emit("stop-typing", nickname);
        setInputText("");
    };

    return (
        <>
            <Head>
                <title>FDCord - Chat app</title>
                <meta name="description" content="FDCord - Chat App" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="w-screen h-screen bg-zinc-800">
                {/* header */}
                <header id="topNavGroupName">
                    <div className="flex fixed top-0 flex-col pt-1 m-0 w-screen shadow-lg md:h-18 h-26 mb-26 md:mb-18 bg-zinc-900">
                        <div className="ml-24 lg:ml-28">
                            <p className="text-lg font-bold text-white">FDCord {whoIsTyping}</p>
                            <label className="label">Your Nickname: </label>
                            <input
                                type="text"
                                className="py-1 mx-2 my-2 text-center rounded-sm outline-none bg-zinc-600"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                            />
                        </div>
                    </div>
                </header>
                <div className="overflow-scroll p-2 pt-32 pb-16 rounded bg-zinc-800">
                    {/* message content */}
                    {messages.map((e: any, index: any) => (
                        <div
                            className={
                                e.from == nickname
                                    ? "p-2 text-end rounded mb-2 w-auto"
                                    : "p-2 text-start rounded mb-2 w-auto"
                            }
                            key={index}
                        >
                            <p>
                                <strong className="font-bold">{e.from == nickname ? "You" : e.from}</strong>{" "}
                                <br />
                                {e.message}
                                <br />
                                {
                                    urlRegex.test(e.message)
                                        ? <p className="text-emerald-300">Link in message:</p>
                                        : ''
                                }
                                <a target="_blank" className="text-sky-500 hover:text-sky-600" href={
                                    e.message.match(urlRegex)
                                }>{e.message.match(urlRegex)}</a>
                            </p>
                        </div>
                    ))}
                    {/* input text */}
                </div>
                <div id="chatBar">
                    <form onSubmit={sendMessage}>
                        <div className="flex fixed right-1 bottom-1 rounded-lg">
                            <input id="messageBox" type="text" autoComplete="off" className="flex outline-none border-none rounded-sm px-3 md:py-2 md:w-screen mb-2 w-[42vh] text-white bg-zinc-900" size={100}
                                placeholder="Type a message"
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
                            <span className="p-2 text-3xl border-r-4 md:hidden bg-zinc-700 border-zinc-700">
                                <svg onClick={sendMessage} className="block bottom-0 w-7 h-7 bg-white rounded-xl cursor-pointer hover:bg-white"
                                    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
                                </svg>
                            </span>
                        </div>
                    </form>
                </div>
                {/* noscript */}
                <noscript
                    className="flex fixed top-0 right-0 bottom-0 left-0 justify-center items-center w-screen h-screen text-3xl font-bold text-white bg-zinc-900">
                    You need to enable JavaScript to run this app.
                </noscript>
            </main>
        </>
    )
}