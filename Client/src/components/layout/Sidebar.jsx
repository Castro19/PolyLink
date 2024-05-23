import React, { useEffect } from "react";
import styles from "./sidebar.module.css";
import { MdClose } from "react-icons/md"; // Importing the close icon
import ChatLog from "../chatLog/ChatLog";
import UserMenu from "@/components/userProfile/UserMenu";
// Redux:
import { useSelector, useDispatch } from "react-redux";
import {
  toggleSidebar as toggleReduxSidebar,
  toggleNewChat as toggleReduxNewChat,
  setCurrentChatId as setReduxCurrentChatId,
} from "../../redux/layout/layoutSlice";
import { setMsgList as msgReduxSetList } from "../../redux/chat/messageSlice";
import { fetchLogs as fetchReduxLogs } from "../../redux/log/logSlice";
import { useAuth } from "../../contexts/authContext";

const Sidebar = () => {
  // Redux:
  const dispatch = useDispatch();
  const isSidebarVisible = useSelector(
    (state) => state.layout.isSidebarVisible
  );
  const logList = useSelector((state) => state.log.logList);
  const { userId } = useAuth();
  useEffect(() => {
    dispatch(fetchReduxLogs(userId));
  }, [dispatch, userId]);
  // Added transition classes and conditional translate classes
  const sidebarClasses = `fixed top-0 left-0 h-screen w-64 bg-white dark:bg-gray-800 z-40 overflow-y-auto shadow-lg p-4 transition-transform duration-300 ease-in-out ${
    isSidebarVisible ? "translate-x-0" : "-translate-x-full"
  } border-r border-gray-200 dark:border-gray-700`;

  // Handler for selecting a log to view
  const handleSelectLog = (logId) => {
    const chosenLog = logList.find((item) => item.id === logId);
    // Set the content for the msgList
    dispatch(msgReduxSetList(chosenLog.content));
    // Set the current chat id
    dispatch(setReduxCurrentChatId(logId));
    dispatch(toggleReduxNewChat(false));

    dispatch(toggleReduxSidebar(false)); // close slidebar
  };

  return (
    <aside className={`${sidebarClasses} flex flex-col h-full`}>
      <div className="relative text-gray-700 dark:text-white flex-shrink-0">
        <button
          onClick={() => dispatch(toggleReduxSidebar(false))}
          className="
            absolute  right-4
            p-2
            rounded-full
            bg-gray-200 dark:bg-gray-700
            text-gray-600 dark:text-gray-300
            hover:bg-gray-300 dark:hover:bg-gray-600
            focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-300 text-xl
          "
          aria-label="Close sidebar"
        >
          <MdClose />
        </button>
        <h2 className="font-semibold text-xl my-2 border-b-2 border-gray-200 dark:border-gray-300 pb-2">
          Chat Logs
        </h2>
      </div>
      <div
        className={`flex-grow overflow-y-auto overflow-x-hidden scroll-smooth ${styles.customScrollbar}`}
      >
        {logList.length > 0 ? (
          logList.map((log) => (
            <ChatLog key={log.id} log={log} onSelectLog={handleSelectLog} />
          ))
        ) : (
          <div>No chat logs available</div>
        )}
      </div>
      <div className="relative border-t-2 border-gray-200 dark:border-gray-500 box-shadow p-4">
        <UserMenu />
      </div>
    </aside>
  );
};

export default Sidebar;
