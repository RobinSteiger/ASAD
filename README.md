# Multiplayer Roulette Project

This is a real-time roulette game. It uses Angular for the client and NestJS for the server.

# Tech Stack

Frontend: Angular + Signals + Tailwind CSS

Backend: NestJS + WebSockets

# How to run the project

Follow these steps to start the application:

1. Start the Backend (NestJS)
   The server handles the game logic, bets, and the timer.

Bash
cd nestjs_server
npm install
npm run start:dev
The server will start on http://localhost:3000.

2. Start the Frontend (Angular)
   The web interface for the players.

Bash
cd angular-client
npm install
npm run start
Open http://localhost:4200 in your browser.

# Key Information

Why NestJS? I used NestJS because Angular Signals need a very strict and stable data structure. NestJS helps to keep the data "typed" and clean to avoid bugs in the frontend.

Real-time: The game is synchronized. All players see the same countdown and the same winning number at the same time.

UI/UX: I used Tailwind CSS for the design. We can work together to improve the visuals later!

## Launch the server

cd src/node_server
node server.js

## Launch a client

cd src/node_client
node client.js
