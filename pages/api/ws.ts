import { Server } from "socket.io";


export default function handler(req:any ,res:any) {
  // It means that socket server was already initialised
  if (res.socket.server.io) {
    console.log("Already set up");
    res.end()
    return;
  }

  const io = new Server(res.socket.server);
  res.socket.server.io = io;
  const USERS = [];

  // socket io on connected user
  io.on("connection", (socket:any) => {
    console.log(socket.id)
    // disconnected user
    socket.on("disconnect", () => {
      console.log(socket.id + " user diconnected");
    });

    // listen message
    socket.on("message", (message:any) => {
      message.date = new Date().toLocaleString();
      console.log(message);
      io.emit("message", message);
    });

    // is typing
    socket.on("typing", (user:string) => {
      console.log(`${user} is typing...`);
      io.emit("typing", user);
    });

    // stop typing
    socket.on("stop-typing", (user:string) => {
      io.emit("stop-typing", user);
    });
  });

  console.log("Setting up socket");
  res.end()
}