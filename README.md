# Chat-Application
Real-Time Chat Application with MERN and Socket.IO
Description
This is a real-time chat application built using the MERN stack (MongoDB, Express.js, React, Node.js) and Socket.IO. It allows users to join chat rooms, exchange messages in real-time, and stay connected.

Features
Real-Time Communication: Utilizes Socket.IO for real-time bidirectional event-based communication.
User Authentication: Secure user authentication powered by JWT (JSON Web Tokens).
Persistent Data: Messages are stored in a MongoDB database, providing data persistence.
Responsive Design: The front-end is built using React to ensure a responsive and modern user interface.
Technologies Used
Front-end:

React
Socket.IO Client
Back-end:

Node.js
Express.js
Socket.IO
MongoDB (with Mongoose for ODM)
Installation
Clone the repository:

bash
Copy code
git clone https://github.com/merakesh1/Chat-Application.git
cd real-time-chat-app
Install dependencies for both the server and client:

bash
Copy code
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
Set up MongoDB:

Create a MongoDB database and update the connection string in server/config/db.js.
Start the server and client.

bash
Copy code
Start the server
cd server
npm start

# Start the client
cd ../client
npm start
Open your browser and visit http://localhost:3000 to use the chat application.

Usage
Sign up for an account or log in if you already have one.
Create or join a chat room.
Start chatting in real-time with other users in the same chat room.
License
This project is licensed under the MIT License.

Acknowledgments
This project was inspired by the need for a real-time chat solution using modern web technologies.
Special thanks to the open-source community for the tools and libraries used in this project.
