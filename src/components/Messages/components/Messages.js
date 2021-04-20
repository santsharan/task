import React, {
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import io from "socket.io-client";
import useSound from "use-sound";
import config from "../../../config";
import LatestMessagesContext from "../../../contexts/LatestMessages/LatestMessages";
import TypingMessage from "./TypingMessage";
import Header from "./Header";
import Footer from "./Footer";
import Message from "./Message";
import "../styles/_messages.scss";
import initMsg from "../../../common/constants/initialBottyMessage";

const socket = io(config.BOT_SERVER_ENDPOINT, {
  transports: ["websocket", "polling", "flashsocket"],
});

function Messages() {
  const [playSend] = useSound(config.SEND_AUDIO_URL);
  const [playReceive] = useSound(config.RECEIVE_AUDIO_URL);
  const { setLatestMessage } = useContext(LatestMessagesContext);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([{ user: "bot", message: initMsg }]);
  const bottomRef = useRef();
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    socket.on("bot-message", (message) => {
      setTyping(false);
      playReceive();
      setMessages([...messages, { user: "bot", message: message }]);
    });
  }, [messages]);

  const scrollToBottom = () => {
    bottomRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const onChangeMessage = (e) => {
    e.preventDefault();
    setMessage(e.target.value);
  };

  const sendMessage = useCallback(() => {
    if (message) {
      setTyping(true);
      socket.emit("user-message", message);
      setMessages([...messages, { user: "me", message: message }]);
      playSend();
      setMessage("");
    }
  }, [message]);

  return (
    <div className="messages">
      <Header />
      <div className="messages__list" id="message-list">
        <div>
          {messages.map((message) => (
            <Message
              key={message.message}
              nextMessage
              message={message}
              botTyping={typing}
            />
          ))}
          {typing ? <TypingMessage /> : null}
          <div ref={bottomRef}></div>
        </div>
      </div>

      <Footer
        message={message}
        sendMessage={sendMessage}
        onChangeMessage={onChangeMessage}
      />
    </div>
  );
}

export default Messages;
