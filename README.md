# AutoNews360

## About
Welcome to AutoNews360, a trailblazer in the digital news industry. Our platform offers a distinctive news reading experience. We employ advanced technologies to gather news stories and present them in an innovative way through animated avatar characters in video clips. We invite you to join us in revolutionizing the way news is consumed.

![AutoNews360 screenshot](/images/screenshot.png)

## Features
- User Registration and Authentication
- Personal Account Management
- Exclusive Access to Articles and Avatar-presented News
- News Updates fetched every 3 hours from newsdata.io
- Advanced Media Streaming through D-ID.com
- Continuous Token-based Authentication System

## Technology Stack
- MERN (MongoDB, Express.js, React, Node.js)
- WebRTC for media streaming
- D-ID for avatar animation
- Nodemailer for email services

## Installation and Setup
Before running the project, ensure the following environment variables are set in your `.env` files in both `frontend` and `backend` directories:

### Backend `.env`
- `MONGODB_URI`: MongoDB Connection String
- `PORT`: Port for the server
- `PROXY_SERVER_PORT`: Port for the proxy server
- `CLIENT_URL`: Client-side URL for navigation
- `API_URL`: API server URL and port
- `NEWSDATA_API_URL`: Newsdata.io API URL
- `D_ID_API_KEY`: Encryption key for D-ID
- `JWT_SECRET`: Secret key for JWT
- `EMAIL_PASSWORD`: Password for Nodemailer email service

### Frontend `.env`
- `REACT_APP_API_URL`: Matching API URL for server connection
- `REACT_APP_PROXY_URL`: Proxy server URL

### Installation Steps
1. Clone the repository to your local machine.
2. Navigate to the root directory of the project.
3. Run `npm install` to install root-level dependencies.
4. Execute `npm run install-all` to install all dependencies for frontend and backend.
5. Set up your `.env` files as mentioned above in both frontend and backend directories.
6. To start the project, run `npm start` from the root directory.

## Usage
After successful installation and setup, the project will be up and running. Users can register, log in, and access the news content presented by the avatar characters. The backend fetches and updates news content every 3 hours, ensuring fresh content delivery.

## Contributing
We welcome contributions and suggestions for improvements. Please feel free to fork the repository, make changes, and submit pull requests. For any questions or feedback, contact us at autonews360news@gmail.com.


