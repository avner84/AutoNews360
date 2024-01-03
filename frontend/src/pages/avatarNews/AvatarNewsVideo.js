import React, { useState, useEffect, useRef } from "react";
import styles from "./AvatarNewsVideo.module.css";
import { useLoaderData, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVideo } from "@fortawesome/free-solid-svg-icons";
import { useUser } from "../../store/UserContext";

import loadingVideo from "./loading_circle_bars.mp4";

// WebRTC Peer Connection setup for cross-browser compatibility.
const RTCPeerConnection = (
  window.RTCPeerConnection ||
  window.webkitRTCPeerConnection ||
  window.mozRTCPeerConnection
).bind(window);

const AvatarNewsVideo = () => {
  // Using React Router's loader data and a context for user management.
  const { article, error } = useLoaderData();
  const { setUser } = useUser();

  // useRef hook to reference the video DOM element.
  const videoRef = useRef();
  // useState hook to manage the state of the first play of video
  const [isFirstPlay, setIsFirstPlay] = useState(true);

  // Image URLs for avatars.
  const sofiaImageUrl =
    "https://create-images-results.d-id.com/google-oauth2%7C113228135334831093217/upl_EEY93HJXprfY-QhMSFjcv/image.png";
  const jackImageUrl =
    "https://create-images-results.d-id.com/google-oauth2%7C113228135334831093217/upl_re6eFAc5DzF8ooqhvqDyg/image.png";

  // Variables for managing the WebRTC connection and streaming.
  let peerConnection;
  let streamId;
  let sessionId;
  let sessionClientAnswer;
  let statsIntervalId;
  let videoIsPlaying;
  let lastBytesReceived;

  // Reference to the video element for manipulating it later.
  const videoElement = videoRef.current;

  // Functions for managing the WebRTC connection and handling different events.
  function onIceCandidate(event) {
    console.log("onIceCandidate", event);
    if (event.candidate) {
      const { candidate, sdpMid, sdpMLineIndex } = event.candidate;

      fetchWithRetries(`${process.env.REACT_APP_PROXY_URL}/api/talks/streams/ice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          streamId: streamId,
          candidate: candidate,
          sdpMid: sdpMid,
          sdpMLineIndex: sdpMLineIndex,
          sessionId: sessionId,
        }),
      });
    }
  }

  function onIceConnectionStateChange() {
    if (
      peerConnection.iceConnectionState === "failed" ||
      peerConnection.iceConnectionState === "closed"
    ) {
      stopAllStreams();
      closePC();
    }
  }

  function onVideoStatusChange(videoIsPlaying, stream) {
    if (videoIsPlaying) {
      const remoteStream = stream;
      setVideoElement(remoteStream);
    }
  }

  function onTrack(event) {
    if (!event.track) return;

    statsIntervalId = setInterval(async () => {
      const stats = await peerConnection.getStats(event.track);
      stats.forEach((report) => {
        if (report.type === "inbound-rtp" && report.mediaType === "video") {
          const videoStatusChanged =
            videoIsPlaying !== report.bytesReceived > lastBytesReceived;

          if (videoStatusChanged) {
            videoIsPlaying = report.bytesReceived > lastBytesReceived;
            onVideoStatusChange(videoIsPlaying, event.streams[0]);
          }
          lastBytesReceived = report.bytesReceived;
        }
      });
    }, 500);
  }

  async function createPeerConnection(offer, iceServers) {
    if (!peerConnection) {
      peerConnection = new RTCPeerConnection({ iceServers });

      peerConnection.addEventListener("icecandidate", onIceCandidate, true);
      peerConnection.addEventListener(
        "iceconnectionstatechange",
        onIceConnectionStateChange,
        true
      );

      peerConnection.addEventListener("track", onTrack, true);
    }

    await peerConnection.setRemoteDescription(offer);
    console.log("set remote sdp OK");

    const sessionClientAnswer = await peerConnection.createAnswer();
    console.log("create local sdp OK");

    await peerConnection.setLocalDescription(sessionClientAnswer);
    console.log("set local sdp OK");

    return sessionClientAnswer;
  }

  function setVideoElement(stream) {
    const videoElement = videoRef.current;
    if (!stream || !videoElement) return;

    videoElement.srcObject = stream;
    videoElement.loop = false;

    // Try to play the video
    videoElement.play().catch((e) => console.error("Error playing video", e));
  }

  function stopAllStreams() {
    if (videoElement && videoElement.srcObject) {
      console.log("stopping video streams");
      videoElement.srcObject.getTracks().forEach((track) => track.stop());
      videoElement.srcObject = null;
    }
  }

  function closePC(pc = peerConnection) {
    if (!pc) return;
    console.log("stopping peer connection");
    pc.close();
    pc.removeEventListener("icecandidate", onIceCandidate, true);
    pc.removeEventListener(
      "iceconnectionstatechange",
      onIceConnectionStateChange,
      true
    );
    clearInterval(statsIntervalId);

    console.log("stopped peer connection");
    if (pc === peerConnection) {
      peerConnection = null;
    }
  }

  const maxRetryCount = 3;
  const maxDelaySec = 4;
  // Function to retry fetching data with exponential backoff.
  async function fetchWithRetries(url, options, retries = 1) {
    try {
      return await fetch(url, options);
    } catch (err) {
      if (retries <= maxRetryCount) {
        const delay =
          Math.min(Math.pow(2, retries) / 4 + Math.random(), maxDelaySec) *
          1000;

        await new Promise((resolve) => setTimeout(resolve, delay));

        console.log(
          `Request failed, retrying ${retries}/${maxRetryCount}. Error ${err}`
        );
        return fetchWithRetries(url, options, retries + 1);
      } else {
        throw new Error(`Max retries exceeded. error: ${err}`);
      }
    }
  }

  // useEffect hook to handle video setup and streaming upon loading.
  useEffect(() => {
    // Ensure there's an article to present.
    if (!article) return;

    const videoElement = videoRef.current;
    if (!videoElement) return;

    const playListener = async () => {
      if (isFirstPlay) {
        videoElement
          .play()
          .catch((e) => console.error("Error playing the video:", e));

        if (peerConnection && peerConnection.connectionState === "connected") {
          return;
        }

        stopAllStreams();
        closePC();

        const sessionResponse = await fetchWithRetries(
          `${process.env.REACT_APP_PROXY_URL}/api/talks/streams`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              source_url:
                article.avatar === "Sofia" ? sofiaImageUrl : jackImageUrl,
            }),
          }
        );

        const {
          id: newStreamId,
          offer,
          ice_servers: iceServers,
          session_id: newSessionId,
        } = await sessionResponse.json();
        streamId = newStreamId;
        sessionId = newSessionId;

        try {
          sessionClientAnswer = await createPeerConnection(offer, iceServers);
        } catch (e) {
          console.log("error during streaming setup", e);
          stopAllStreams();
          closePC();
          return;
        }

        await fetchWithRetries(`${process.env.REACT_APP_PROXY_URL}/api/talks/streams/sdp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            streamId: newStreamId,
            answer: sessionClientAnswer,
            sessionId: newSessionId,
          }),
        });

        if (
          peerConnection?.signalingState === "stable" ||
          peerConnection?.iceConnectionState === "connected"
        ) {
          await fetchWithRetries(
            `${process.env.REACT_APP_PROXY_URL}/api/talks/streams/talk`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                streamId: streamId,
                sessionId: sessionId,
                text: article.title,
                avatar: article.avatar,
              }),
            }
          );
        }

        setIsFirstPlay(false);
      }
    };

    videoElement.addEventListener("play", playListener);

    //The listener for the canplay event is designed to ensure that the loadingVideo starts playing only after the file is fully loaded. This listener initiates playback only after isFirstPlay becomes false, which occurs after the first press on "Play" and changing the video source.
    const canPlayListener = () => {
      if (!isFirstPlay) {
        videoElement.play();
      }
    };

    videoElement.addEventListener("canplay", canPlayListener);

    return () => {
      videoElement.removeEventListener("play", playListener);
      videoElement.removeEventListener("canplay", canPlayListener);
    };
  }, [isFirstPlay, article]);

  // Error handling and rendering logic.
  if (error) {
    let errorMessage = (
      <h2>There was an error on the site. Please try to enter later.</h2>
    );
    if (error.message === "Authentication failed. Please log in.") {
      errorMessage = (
        <p className={styles.accessDeniedAlert}>
          In order to view the articles presented by avatars, you must{" "}
          <Link to="/login">log in</Link> or <Link to="/signup">register</Link>{" "}
          to the site.
        </p>
      );
      localStorage.removeItem("token");
      setUser();
    } else if (error.message === "Article not found.") {
      errorMessage = <h2>Article not found.</h2>;
    } else if (error.message === "Server error. Please try again later.") {
      errorMessage = <h2>Server error. Please try again later.</h2>;
    }
    return <div className={styles.articleContainer}> {errorMessage} </div>;
  }

  if (!article) {
    // In case an article was not found
    return (
      <div className={styles.articleContainer}>
        {" "}
        <h2>Article not found.</h2>
      </div>
    );
  }

  // Main component rendering.
  return (
    <div className={styles.avatarNewsVideoContainer}>
      {article ? (
        <div className={styles.videoWrapper}>
          <video ref={videoRef} controls>
            <source src={loadingVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <h2>
            <FontAwesomeIcon icon={faVideo} /> {article.title}
          </h2>
        </div>
      ) : (
        <h2>There was an error on the site. Please try to enter later.</h2>
      )}
    </div>
  );
};

// Loader function for the React Router to fetch article data.
export async function avatarNewsVideoLoader({ params }) {
  // Fetches and returns article data based on ID and user authentication token.
  const articleId = params.id;
  const token = localStorage.getItem("token");

  // אם אין טוקן, אין גישה
  if (!token) {
    return { error: "Access Denied: No token provided." };
  }

  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/news/article?id=${articleId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      let error = "Something went wrong";
      if (response.status === 401) {
        error = "Authentication failed. Please log in.";
      } else if (response.status === 404) {
        error = "Article not found.";
      } else if (response.status === 500) {
        const responseJson = await response.json();
        // Check if the error message from the server matches the specific token verification error
        if (
          responseJson.message ===
          "Token verification failed. Please provide a valid token."
        ) {
          error = "Authentication failed. Please log in.";
        } else {
          error = "Server error. Please try again later.";
        }
      }
      throw new Error(error);
    }

    const data = await response.json();
    return { article: data.article };
  } catch (error) {
    console.error("Failed to load blog:", error);
    return { error };
  }
}

export default AvatarNewsVideo;
