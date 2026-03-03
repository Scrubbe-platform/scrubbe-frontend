import { io, Socket } from "socket.io-client";
import { COOKIE_KEYS } from "../constant";
import { getCookie } from "cookies-next";

let socket: Socket;

export const initSocket = () => {
  const token = getCookie(COOKIE_KEYS.TOKEN);
  socket = io(process.env.NEXT_PUBLIC_SOCKET_BASE_URL, {
    // you could replace with our base url
    auth: {
      token, // set the user token
    },
    transports: ["websocket", "polling"],
  });

  return socket;
};

export const getSocket = () => socket;
