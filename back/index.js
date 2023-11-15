const express = require('express');
const conn = require('./db/connection');
const Users = require('./Models/Users');
const bcrptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const MessageChannel = require('./Models/MessageChannel');
const Messages = require('./Models/Messages');
const cors = require('cors');
require('dotenv').config();
const socketIo = require('socket.io')(7500, {
    cors: {
        origin: "http://localhost:3000"
    }
})
// const twilio = require('twilio');

const app = express();
conn();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

let users = [];
socketIo.on('connection', (socket) => {
    console.log("connected");
    socket.on("addUsers", (id) => {
        const exist = users.find((user) => user.id === id)
        if (!exist) {
            users.push({
                id,
                socketId: socket.id
            });
            socketIo.emit("getUsers", users);
        }
    })

    socket.on("sendMessage", ({ channelId, senderId , messages ,recieverId}) => {
        const reciever = users.find((user) => user.id == recieverId);
        const sender = users.find((user) => user.id == senderId);
        console.log(channelId, senderId , messages ,recieverId);
        console.log(users);
        console.log("Reciever: ", reciever," Sender: ",  sender);
        if (reciever?.socketId) {
                fetch(`http://localhost:5000/message`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ channelId, senderId, messages, recieverId })
                })
                .then((sentMessages) => {
                    return sentMessages.json();
                })
                .then((fetchedMessages) => {
                    console.log(fetchedMessages);
                    socketIo.to(reciever.socketId).to(sender.socketId).emit("getMessage", fetchedMessages);
                })
                .catch((error) => {
                    console.log(error);
                })
        }
        else{
            fetch(`http://localhost:5000/message`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ channelId, senderId, messages, recieverId })
                })
                .then((sentMessages) => {
                    return sentMessages.json();
                })
                .then((fetchedMessages) => {
                    console.log(fetchedMessages);
                    socketIo.to(sender.socketId).emit("getMessage", fetchedMessages);
                })
                .catch((error) => {
                    console.log(error);
                })
        }
    })

    socket.on("disconnect", () => {
        const disconnectedUser = users.find((user) => user.socketId === socket.id);
        if (disconnectedUser) {
            users = users.filter((user) => user.socketId !== socket.id);
            socket.broadcast.emit("getUsers", users); // Send the updated users array to all clients except the disconnected one
        }
    });
    
})

/* const accountSid = 'ACcb17edbcd0776aa571fa2bd4d8d74f25';
const authToken = '288430fdad6df7143055ac43f637eeef';
const client = new twilio(accountSid, authToken); */
/* 
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
}
 */
/* const otpMap = new Map();
 */
app.get('/', (req, res) => {
    return res.send("hello from express")
})

app.post('/register', async (req, res) => {
    try {
        const { Name, Email, Password, mobile = "" } = req.body;

        if (!Name || !Email || !Password) {
            return res.status(422).json({ error: "Please fill all the fields" })
        }
        const Existing_user = await Users.findOne({ Email: Email });
        if (Existing_user) {
            return res.status(422).json({ error: "User already exist" })
        }
        else {
            /* const otp = generateOTP();
            otpMap.set(phoneNumber, otp); */

            const temp = Password.split('').reverse().join('');
            // hashing
            bcrptjs.hash(Password, 12)
                .then(async (hash) => {
                    const user1 = await Users.create({ Name, Email, Password: hash, temp, mobile });
                    return res.status(201).json({ message: "User registered created", RegisteredDetailsAre: { Name: user1.Name, Email: user1.Email } });
                })
                .catch((err) => {
                    return res.status(500).json({ error: "Internal server error" })
                })
        }
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" })
    }
})

app.post('/login', async (req, res) => {
    const { Email, Password } = req.body;
    if (!Email || !Password) {
        return res.status(422).json({ error: "Please fill all the fields" })
    }
    const UserAvailability = await Users.findOne({ Email: Email });
    if (!UserAvailability) {
        return res.status(422).json({ error: "Invalid credentials" })
    }

    const isPasswordMatched = await bcrptjs.compare(Password, UserAvailability.Password);
    if (!isPasswordMatched) {
        return res.status(422).json({ error: "Invalid credentials" })
    }
    const token = jwt.sign({ id: UserAvailability._id }, 'secretkey');
    return res.status(201).json({ message: "Login successfull", token, _id: UserAvailability._id, username: UserAvailability.Name });
})

app.post('/messageChannel', async (req, res) => {
    console.log("hlo");
    try {
        const { senderId, receiverId } = req.body;
        if (!senderId || !receiverId) {
            return res.status(422).json({ error: "Required fields are not found" });
        }

        // Ensure consistent case in field names
        const existing = await MessageChannel.findOne({ $or: [
            { User_MessageChannel: [senderId, receiverId] },
            { User_MessageChannel: [receiverId, senderId] }
        ] });

        if (existing) {
            return res.status(422).json({ error: "Message channel already exists", channelId: existing._id });
        }

        const conversation = await MessageChannel.create({ User_MessageChannel: [senderId, receiverId] });
        res.status(201).json({ message: "Message channel created successfully!", channelId: conversation._id });
    } catch (error) {
        console.error(error);  // Log the error for debugging
        res.status(500).send("Internal server error");
    }
});


app.get('/messageChannel/:userId', async (req, res) => {
    // console.log("Hey from the server");
    try {
        const { userId } = req.params;
        // console.log('userId: ', userId);
        const conversation = await MessageChannel.find({
            User_MessageChannel: { $in: [userId] }
        });

        // console.log('conversation: ', conversation);

        if (!conversation || conversation.length === 0) {
            return res.status(404).json({ message: "No conversation found" });
        }

        const recieverIds = await Promise.all(
            conversation.map(async (converse) => {
                const recieverId = converse.User_MessageChannel.find((id) => id !== userId);
                const reciever = await Users.findById(recieverId);
                return {
                    reciever: {
                        name_reciever: reciever.Name,
                        email_reciever: reciever.Email,
                        id_reciever: reciever._id
                    },
                    conversationId: converse._id
                };
            })
        );

        if (!recieverIds || recieverIds.length === 0) {
            return res.status(404).json({ message: "No conversation found" });
        }
        return res.status(200).json({ recieverIds });
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal server error");
    }
});

app.post('/message', async (req, res) => {
    // console.log(req.body);
    try {
        const { channelId, senderId, messages,                                                                      recieverId="" } = req.body;
        console.log('channelId :>> ', channelId, 'senderId :>> ', senderId, 'messages :>> ', messages, 'recieverId :>> ', recieverId);
        if (!senderId || !messages) {
            return res.status(422).json({ error: "No data found" });
        }
        if ((!channelId || channelId.length === 0) && recieverId) {
            const channel = await MessageChannel.create({ User_MessageChannel: [senderId, recieverId] });
            const message = await Messages.create({ conversationId: channel._id, senderId, messages,recieverId });
            return res.status(201).json({ message: "Message sent", messageDetails: message });
        }
        if ((channelId.length === 0 || !channelId) && !recieverId) {
            return res.status(422).json({ message: "invalid input" });
        }
        const message = await Messages.create({ conversationId: channelId, senderId, messages ,recieverId});
        return res.status(201).json({ message: "Message sent", messageDetails: message });
    }
    catch (error) {
        return res.status(500).send("Internal server error");
    }
})

app.get('/message/:channelId', async (req, res) => {
    const { channelId } = req.params;

    if (channelId === 'new') {
        return res.status(200).json({ message: "no elements found", arr: [] });
    }
    const messages = await Messages.find({ conversationId: channelId });
    // console.log('messages :>> ', messages);
    return res.status(200).json({ messages, _id: channelId });
})

app.get('/getUsers', async (req, res) => {
    const existing_user = await Users.find({});
    const existing_user_details = existing_user.map(user => {
        return ({ userDetails: { name: user.Name, email: user.Email, mobile: user.mobile }, UserId: user._id });
    });
    return res.status(200).send(existing_user_details);
})

app.get('/getUsers/:userId', async (req, res) => {
    try {
        const existing_users = await Users.find({});
        const { userId } = req.params;

        const existing_user_details = await Promise.all(
            existing_users.map(async (user) => {
                if (user._id.toString() !== userId) {
                    const isConversationValid = await MessageChannel.findOne({
                        $and: [
                            { User_MessageChannel: userId },
                            { User_MessageChannel: user._id.toString() }
                        ]
                    });

                    if (!isConversationValid) {
                        return {
                            userDetails: { name: user.Name, email: user.Email, mobile: user.mobile },
                            UserId: user._id.toString()
                        };
                    }
                }
            })
        );

        return res.status(200).send(existing_user_details.filter(Boolean)); // Filter out undefined values
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: 'Internal Server Error' });
    }
});

app.post('/forget', async (req, res) => {
    const { email } = req.body;
    const exist_user = await Users.findOne({ Email: email });
    if (!exist_user) {
        return res.status(422).json({ error: "User not found" });
    }
    return res.status(200).json({ message: "Email sent", password: exist_user.temp.split('').reverse().join('') });
})

/* app.post('/send-otp', (req, res) => {
    const phoneNumber = req.body.phoneNumber;
    console.log('phone number :>> ', phoneNumber);
    const otp = generateOTP();

    otpMap.set(phoneNumber, otp);

    client.messages.create({
        body: `Your OTP is: ${otp}`,
        from: '+14012170357',
        to: phoneNumber
    })
        .then(() => res.status(200).send('OTP sent successfully'))
        .catch(error => res.status(500).send('Error sending OTP: ' + error.message));
});

app.post('/verify-otp', (req, res) => {
    const phoneNumber = req.body.phoneNumber;
    const userOTP = req.body.otp;
    const storedOTP = otpMap.get(phoneNumber);

    if (userOTP && storedOTP && userOTP === storedOTP) {
        // OTP is correct, proceed with account activation or other actions
        res.status(200).send('OTP verified successfully');
    } else {
        res.status(401).send('Invalid OTP');
    }
}); */

app.listen(5000);

