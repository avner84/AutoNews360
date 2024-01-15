const fastify = require("fastify")({ logger: true });
const fetch = require("node-fetch");
const cors = require("@fastify/cors");
const {proxyServerUrl, proxyPort} = require('./config/default');
const {D_ID_API_KEY: API_KEY} = require('./config/vars');

// Enable CORS for all requests
fastify.register(cors, { origin: true });

// Endpoint for creating a new stream
fastify.post("/api/talks/streams", async (req, reply) => {
  // Log the request details to the external API
  console.log("Request data to the external API:", {
    method: "POST",
    headers: {
      Authorization: `Basic ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req.body),
  });

  // Perform the API request
  const response = await fetch(`https://api.d-id.com/talks/streams`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req.body),
  });

  // Retrieve and log the response from the external API
  const data = await response.json();
  console.log("Response from the external API:", data);

  // Send the response data back to the client
  reply.send(data);
});

// Endpoint for posting the Session Description Protocol (SDP) data
fastify.post("/api/talks/streams/sdp", async (req, reply) => {
  const { streamId, answer, sessionId } = req.body;

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
        answer,
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
fastify.post("/api/talks/streams/talk", async (req, reply) => {
  const { streamId, sessionId, text, avatar } = req.body;

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
fastify.post("/api/talks/streams/destroy", async (req, reply) => {
  const { streamId, sessionId } = req.body;

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
fastify.post("/api/talks/streams/ice", async (req, reply) => {
  const { streamId, candidate, sdpMid, sdpMLineIndex, sessionId } =
    req.body;

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
        candidate,
        sdpMid,
        sdpMLineIndex,
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
const PROXY_SERVER_URL = proxyServerUrl || "http://localhost";
const PROXY_SERVER_PORT = proxyPort || 3001;


fastify.listen({ port: PROXY_SERVER_PORT }, (err) => {
    if (err) throw err;
    console.log(`Proxy server is running at ${PROXY_SERVER_URL}:${PROXY_SERVER_PORT}`);
});