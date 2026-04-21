# Multiplayer Roulette Project

This project a real-time roulette game. It uses Angular for the client and NestJS for the server.

## 0. Setup and launch 

Follow these steps to start the application:

Start the Backend (NestJS) :

   ```
   cd src/nestjs_server  
   npm install  
   npm run start:dev  
   ```

The server will start on `http://localhost:3000`.

Start the Frontend (Angular) :

   ```
   cd ../angular-client
   npm install
   npm run start
   ```

The client will start on `http://localhost:4200`.

# TODO :

Remove player when solde is None --> Fix in server, and add a view in client  

Remove the choice of the solde at the beginning  

Add logs

# Optional :

Add a list of all players and their actual solde   
Add case red / black, even / odd  
Add more time to let the players bet (a bit short actually)  

# For the report :

## 0. Tech Stack

Frontend: Angular + Signals + Tailwind CSS

Backend: NestJS + WebSockets

# Key Information

Why NestJS? I used NestJS because Angular Signals need a very strict and stable data structure. NestJS helps to keep the data "typed" and clean to avoid bugs in the frontend.

Real-time: The game is synchronized. All players see the same countdown and the same winning number at the same time.

UI/UX: I used Tailwind CSS for the design. We can work together to improve the visuals later!
