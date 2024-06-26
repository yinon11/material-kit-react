import React, { useState, useEffect, useCallback } from "react";
import { throttle } from "lodash";
import { useBrowserInfoSender } from "./BrowserInfoSender";

function Recorder3() {
  useBrowserInfoSender();
  const [recording, setRecording] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [username, setUsername] = useState(localStorage.getItem("username")); // State for username
  const [userLoggedIn, setUserLoggedIn] = useState(false); // State to check if user is logged in

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const saveUsername = () => {
    localStorage.setItem("username", username);
    setUserLoggedIn(true);
    setRecording(true);
    sessionStorage.setItem("isRecording", true);
  };

  // Function to send mouse movement data via POST request
  const sendMouseMovement = useCallback(async () => {
    if (recording && pendingRequests.length > 0) {

      const { x, y, scrollX, scrollY, actionType, url, key } =
        pendingRequests[0];
      try {
        await fetch(`https://api.visual-log.com/rec2`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user: username,
            data: { x, y, scrollX, scrollY, actionType, url, key },
          }),
        });
        setPendingRequests((prevRequests) => prevRequests.slice(1));
      } catch (error) {
        console.error("Error:", error);
      }
    }
  }, [recording, pendingRequests, username]);
  useEffect(() => {
    const handleMouseMove = throttle((event) => {
      if (!recording) return;
      const { clientX, clientY } = event;
      setPendingRequests((prevRequests) => [
        ...prevRequests,
        {
          x: clientX,
          y: clientY,
          scrollX: window.scrollX,
          scrollY: window.scrollY,
          actionType: "M",
          url: window.location.href,
        },
      ]);
    }, 400);

    const handleClick = (event) => {
      console.log("click");
      if (!recording) return;
      const { clientX, clientY } = event;
      setPendingRequests((prevRequests) => [
        ...prevRequests,
        { x: clientX, y: clientY, actionType: "C", url: window.location.href },
      ]);
    };

    const handleKeyDown = (event) => {
      if (!recording) return;
      const { key } = event;
      setPendingRequests((prevRequests) => [
        ...prevRequests,
        { key, actionType: "K", url: window.location.href },
      ]);
    };

    const handleScroll = (event) => {
      if (!recording) return;

      setPendingRequests((prevRequests) => [
        ...prevRequests,
        {
          scrollX: window.scrollX,
          scrollY: window.scrollY,
          actionType: "S", // S for scroll action
          url: window.location.href,
        },
      ]);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("scrollEnd", handleScroll);

    // Clean up event listeners when component unmounts
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("scrollEnd", handleScroll);
    };
  }, [recording]);

  // useEffect hook to send requests when recording state or pendingRequests array changes
  useEffect(() => {
    sendMouseMovement();
  }, [recording, pendingRequests, sendMouseMovement]);

  return (
    <div>
      {!userLoggedIn && (
        <>
          <input
            type="text"
            value={username}
            onChange={handleUsernameChange}
            placeholder="Enter Username"
          />
          <button type="button" onClick={saveUsername}>Log in</button>
        </>
      )}
    </div>
  );
}

export default Recorder3;
