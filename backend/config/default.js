
module.exports = {
    port: 8080, 
    protocol: "http", 
    host: "localhost",
    origin: `http://localhost:3000`, // CLIENT_URL
    api: `http://localhost:8080`, // API_URL
    proxyPort: 3001, // PROXY_SERVER_PORT
    proxyServerUrl: `http://localhost`, // PROXY_SERVER_URL
  };
  