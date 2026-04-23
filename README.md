# Experiment 10: WebSocket Chat Application

This repository contains the full-stack implementation of a real-time Chat Application. It uses WebSockets for bi-directional communication, featuring a Java Spring Boot backend and a modern React frontend built with Vite.

## 🚀 Technologies Used

**Backend (Demo_WebSocket):**
- **Java Spring Boot**
- **Spring WebSocket**: Core WebSocket support in the Spring ecosystem.
- **Spring Messaging**: For STOMP (Simple Text Oriented Messaging Protocol) message routing.
- **SockJS Fallback**: Provides a WebSocket-like object with fallback capabilities for older browsers.

**Frontend (frontend):**
- **React**: Component-based UI library.
- **Vite**: Next-generation frontend tooling for incredibly fast hot module replacement and builds.
- **@stomp/stompjs & sockjs-client**: Libraries to establish WebSocket connections, handle fallbacks, and communicate via STOMP.

## 🏗️ Architecture & Flow

1. **Client Connection**: The React frontend uses `sockjs-client` to connect to the backend endpoint at `http://localhost:8080/ws`.
2. **STOMP Protocol**: Upon successful connection, `@stomp/stompjs` establishes a STOMP session over the SockJS channel.
3. **Subscribing**: The frontend client subscribes to the topic `/topic/messages`. Whenever the backend broadcasts a message to this topic, the client receives it and dynamically updates the chat UI.
4. **Publishing**: When a user types a message and clicks send, the STOMP client sends a JSON payload to the backend application destination `/app/chat`.
5. **Message Routing**: The backend Spring Controller receives the incoming message and relays it back to the active subscribers on `/topic/messages`.

## 🛠️ How to Run Locally

### 1. Start the Backend Server
Navigate to the `Demo_WebSocket` directory, which handles the WebSocket Broker. A convenient batch script is provided for Windows environments.

```bash
cd Demo_WebSocket
.\run.bat
```
*(By default, this server listens on port **8080**).*

### 2. Start the Frontend Server
Open a **new terminal window**, navigate to the `frontend` directory, install the Node packages, and spin up the development server.

```bash
cd frontend
npm install
npm run dev
```
*(By default, the Vite server will run on `http://localhost:5173/`. Open this URL in your web browser).*

## Screenshot
![Application Screenshot](./ss/image.png)

## 💡 Common Issues & Fixes
- **Port Clashes**: If port `8080` is occupied by another process, execute the provided `kill-port.bat` script inside `Demo_WebSocket` to free up the port before running `run.bat`.
- **WebSocket Connection Failed**: Ensure the Spring Boot backend has successfully booted *before* attempting to send messages from the frontend.
- **"No inputs were found..." TypeScript Error**: This pure-JS project uses `jsconfig.json`. If you previously saw TypeScript errors with `tsconfig.json`, that file was safely removed to favor a standard JS environment.

