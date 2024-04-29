import React from "react";
import { RiChatNewFill } from "react-icons/ri";

// Redux:
import { useSelector, useDispatch } from "react-redux";
import { toggleNewChat as toggleReduxNewChat } from "../../redux/ui/uiSlice";
import { resetMsgList as resetReduxMsgList } from "../../redux/message/messageSlice";

const NewChat = () => {
  // Redux:
  const dispatch = useDispatch();
  const currentMsgList = useSelector((state) => state.message.msgList);

  const toggleNewChat = () => {
    if (currentMsgList.length > 0) {
      dispatch(resetReduxMsgList()); // Reset the MsgList
      dispatch(toggleReduxNewChat(true)); // Flag indicating it's a new chat
    }
  };

  return (
    <button onClick={toggleNewChat} className="text-lg">
      <RiChatNewFill />
    </button>
  );
};

export default NewChat;