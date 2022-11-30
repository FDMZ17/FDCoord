import { Server } from "socket.io";


export default function handler(req: any, res: any) {
  // It means that socket server was already initialised
  if (res.socket.server.io) {
    console.info("Already set up");
    res.end()
    return;
  }

  const io = new Server(res.socket.server);
  res.socket.server.io = io;

  // socket io on connected user
  io.on("connection", (socket: any) => {
    socket.on("disconnect", () => {
    });

    // listen message
    socket.on("message", (message: any) => {
      io.emit("message", message);
    });

    // is typing
    socket.on("typing", (user: string) => {
      io.emit("typing", user);
    });

    // stop typing
    socket.on("stop-typing", (user: string) => {
      io.emit("stop-typing", user);
    });
  });

  console.info("Setting up socket");
  res.end()
}