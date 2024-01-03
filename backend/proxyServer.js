require("dotenv").config();

const fastify = require("fastify")({ logger: true });
const fetch = require("node-fetch");
const cors = require("@fastify/cors");

const API_KEY = process.env.D_ID_API_KEY;

// Enable CORS for all requests
fastify.register(cors, { origin: true });

// Endpoint for creating a new stream
fastify.post("/api/talks/streams", async (request, reply) => {
  // Log the request details to the external API
  console.log("Request data to the external API:", {
    method: "POST",
    headers: {
      Authorization: `Basic ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request.body),
  });

  // Perform the API request
  const response = await fetch(`https://api.d-id.com/talks/streams`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request.body),
  });

  // Retrieve and log the response from the external API
  const data = await response.json();
  console.log("Response from the external API:", data);

  // Send the response data back to the client
  reply.send(data);
});

// Endpoint for posting the Session Description Protocol (SDP) data
fastify.post("/api/talks/streams/sdp", async (request, reply) => {
  const { streamId, answer, sessionId } = request.body;

  // Perform the API request to the external service
  const sdpResponse = await fetch(
    `https://api.d-id.com/talks/streams/${streamId}/sdp`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        answer: answer,
        session_id: sessionId,
      }),
    }
  );

  // Retrieve and log the response from the external API
  const data = await sdpResponse.json();
  console.log("Response from the external API for SDP:", data);

  // Send the response data back to the client
  reply.send(data);
});

// Endpoint for initiating a talk stream
fastify.post("/api/talks/streams/talk", async (request, reply) => {
  const { streamId, sessionId, text, avatar } = request.body;

  // Perform the API request to the external service
  const talkResponse = await fetch(
    `https://api.d-id.com/talks/streams/${streamId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        script: {
          type: "text",
          input: text,
          provider: {
            type: "microsoft",
            voice_id:
              avatar === "Sofia" ? "en-US-JennyNeural" : "en-US-GuyNeural",
            voice_config: {
              style: "Newscast",
            },
          },
        },
        driver_url: "bank://lively/",
        config: {
          stitch: true,
        },
        session_id: sessionId,
      }),
    }
  );

  // Retrieve and log the response from the external API
  const data = await talkResponse.json();
  console.log("Response from the external API for talk:", data);

  // Send the response data back to the client
  reply.send(data);
});

// Endpoint for destroying a stream
fastify.post("/api/talks/streams/destroy", async (request, reply) => {
  const { streamId, sessionId } = request.body;

  // Perform the API request to the external service
  const destroyResponse = await fetch(
    `https://api.d-id.com/talks/streams/${streamId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Basic ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ session_id: sessionId }),
    }
  );

  // Retrieve and log the response from the external API
  const data = await destroyResponse.json();
  console.log("Response from the external API for destroy:", data);

  // Send the response data back to the client
  reply.send(data);
});

// Endpoint for ICE candidate exchange
fastify.post("/api/talks/streams/ice", async (request, reply) => {
  const { streamId, candidate, sdpMid, sdpMLineIndex, sessionId } =
    request.body;

  // Perform the API request to the external service
  const iceResponse = await fetch(
    `https://api.d-id.com/talks/streams/${streamId}/ice`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        candidate: candidate,
        sdpMid: sdpMid,
        sdpMLineIndex: sdpMLineIndex,
        session_id: sessionId,
      }),
    }
  );

 // Retrieve and log the response from the external API
 const data = await iceResponse.json();
 console.log("Response from the external API for ICE:", data);

 // Send the response data back to the client
 reply.send(data);
});


// Start the server
const PROXY_SERVER_URL = process.env.PROXY_SERVER_URL || "http://localhost";
const PROXY_SERVER_PORT = process.env.PROXY_SERVER_PORT || 3001;


fastify.listen({ port: PROXY_SERVER_PORT }, (err) => {
    if (err) throw err;
    console.log(`Proxy server is running at ${PROXY_SERVER_URL}:${PROXY_SERVER_PORT}`);
});