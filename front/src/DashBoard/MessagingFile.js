import React, { useEffect, useRef, useState } from 'react';
import profile from '../Images/vk.png';
import backgroundImg from '../Images/backgroundImg.png';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const MessagingFile = () => {
    const [userDetails, setuserDetails] = useState({});
    const [conversation, setConversation] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [conversationId, setConversationId] = useState("");
    const [reciever, setReciever] = useState({});
    const [users, setUsers] = useState([]);
    const navigate = useNavigate({ replace: true });
    const [socket, setSocket] = useState(null);
    const scrolldown = useRef(null);

    useEffect(() => {
        try {
            const user = JSON.parse(sessionStorage.getItem('user'));
            const fetchUser = async () => {
                setuserDetails({ uname: user.userName, uid: user.userId });
                // console.log(`${process.env.REACT_APP_HTTP}/messageChannel/${user.userId}`);
                const conversations = await fetch(`${process.env.REACT_APP_HTTP}/messageChannel/${user.userId}`, {
                    method: "GET"
                })
                const conversationIds = await conversations.json();
                // console.log(conversationIds);
                if (conversationIds.message) {
                    setConversation([]);
                }
                else {
                    // console.log(conversationIds);
                    setConversation(conversationIds.recieverIds);
                }
            }
            fetchUser();
            const allUsers = async () => {
                const allusers = await fetch(`${process.env.REACT_APP_HTTP}/getUsers/${user.userId}`, {
                    method: "GET"
                })
                const fetchedusers = await allusers.json();
                // console.log(fetchedusers);
                setUsers(fetchedusers);
            }
            allUsers();

        } catch (error) {
            console.log(error);
        }
    }, [])

    useEffect(() => {
        setSocket(io("http://127.0.0.1:7500"))
    }, [])

    useEffect(() => {
        socket?.emit("addUsers", userDetails.uid);
        socket?.on("getUsers", (users) => {
            console.log(users);
        });
        socket?.on("getMessage", (data) => {
            console.log(data.messageDetails);
            setMessages((prevMessages) => {
                const isMessageAlreadyReceived = prevMessages.some(
                    (message) => message._id === data.messageDetails._id
                );

                if (!isMessageAlreadyReceived) {
                    return [...prevMessages, data.messageDetails];
                }

                return prevMessages;
            });
        });
    }, [socket]);

    useEffect(() => {
        scrolldown.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    const fetchMessages = async (conversationId) => {
        try {
            const messagesResponse = await fetch(`${process.env.REACT_APP_HTTP}/message/${conversationId}`, {
                method: "GET"
            });
            const fetchedMessages = await messagesResponse.json();

            if (fetchedMessages.messages && fetchedMessages.messages.length > 0) {
                setMessages([...fetchedMessages.messages]);
            } else {
                setMessages([]);
            }

            // Set conversationId and reciever
            const reciever = conversation.find((element) => element.conversationId === conversationId);

            setReciever(reciever.reciever);
            setConversationId(conversationId);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const sendMessage = async () => {
        const reciever = conversation?.filter((user) => {
            if (user.conversationId == conversationId) {
                return true
            }
            return false
        })

        socket?.emit("sendMessage", {
            channelId: conversationId, senderId: userDetails.uid, messages: newMessage, recieverId: reciever[0].reciever.id_reciever
        })
        setNewMessage("");
    }

    const newUsers = async (new_recieverId) => {
        const Create_Channel = await fetch(`${process.env.REACT_APP_HTTP}/messageChannel`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            // senderId, receiverId
            body: JSON.stringify({ senderId: userDetails.uid, receiverId: new_recieverId })
        })
        const channelObj = await Create_Channel.json();
        console.log(channelObj);
    }
    return (
        <>
            <div className="container-lg" style={{ display: 'flex' }}>
                <div className='w-25' style={{ height: "100vh", backgroundColor: "white", borderRight: "1px solid #dcdcdc" }}>
                    <div
                        className="my-4 d-flex align-items-center justify-content-center"
                        style={{ minHeight: "100px" }}
                    >
                        <div className="mx-3">
                            <img
                                src={profile}
                                alt="Not found"
                                height={55}
                                width={55}
                                style={{ borderRadius: "50%", border: "2px solid blue", position: "relative", }}
                            />
                        </div>
                        <div
                            style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignContent: "center" }}
                        >
                            <h3 style={{ fontSize: "18px" }}>{userDetails.uname}</h3>
                            <p style={{ fontSize: "14px" }}>My Account</p>
                        </div>
                    </div>
                    <hr />
                    <div>
                        <div style={{ color: "#1E88E5", textAlign: "left", fontWeight: "600", marginLeft: "15px", fontSize: "17px" }}>Messages</div>
                        <div>
                            {

                                conversation.length === 0 ? <p style={{ marginTop: "30px", fontWeight: "600", fontSize: "15px" }}>Evaru leru le lite tisko!</p> :
                                    conversation.map(({ reciever, conversationId }) => {
                                        return (
                                            <div onClick={() => fetchMessages(conversationId)} className='my-4 mx-4' style={{ display: "flex", borderBottom: "1px solid #dcdcdc", padding: "10px", cursor: "pointer" }} key={reciever.name_reciever}>
                                                <div>
                                                    <img src={profile} alt='Not found' height={50} width={50} style={{ borderRadius: "50%" }} />
                                                </div>
                                                <div style={{ marginLeft: "18px", textAlign: "left" }}>
                                                    <h3 style={{ fontSize: "18px" }}>{reciever.name_reciever}</h3>
                                                    <p style={{ fontSize: "15px" }}>{reciever.email_reciever}</p>
                                                </div>
                                            </div>
                                        )
                                    })
                            }
                        </div>
                    </div>
                </div>
                <div className='w-50' style={{ height: "100vh", backgroundColor: "white" }}>
                    {
                        reciever.name_reciever ?
                            <div style={{ display: "flex", flexDirection: "row" }}>
                                <div className='my-3' style={{ width: "85%", height: "50px", borderRadius: "25px", backgroundColor: "#009086", display: "flex", alignItems: "center", margin: "auto" }}>
                                    <div>
                                        <img src={profile} width={40} height={40} style={{ borderRadius: "50%", marginLeft: "3px" }} alt='not found' />
                                    </div>
                                    <div style={{ position: "relative", top: "10px", marginLeft: "10px" }}>
                                        <h3 style={{ color: "white", fontSize: "12px", position: "relative", left: "-17px" }}>{reciever.name_reciever}</h3>
                                        <p style={{ color: "white", fontSize: "10px", position: "relative", top: "-5px" }}>{reciever.email_reciever}</p>
                                    </div>
                                    <div style={{ marginLeft: "auto", marginRight: "20px" }}>
                                        <i className="fa-solid fa-phone fa-sm" style={{ color: "white" }}></i>
                                    </div>
                                </div>
                                <div className='mx-3'>
                                    <button type='button' className='btn btn-sm mt-4' style={{ backgroundColor: "#009086", color: "white", borderRadius: "25px" }} onClick={() => {
                                        localStorage.removeItem('user');
                                        navigate('/login');
                                    }}>Logout</button>
                                </div>
                            </div> : <div className='mx-3'>
                                <button type='button' className='btn btn-sm mt-4' style={{ backgroundColor: "#009086", color: "white", borderRadius: "25px", position: "relative", left: "350px" }} onClick={() => {
                                    sessionStorage.removeItem('user');
                                    navigate('/login');
                                }}>Logout</button>
                            </div>
                    }
                    <div style={{ height: !reciever.name_reciever && !conversationId ? "100%" : "82%", overflowY: !reciever.name_reciever && !conversationId ? "auto" : "scroll", width: "100%", backgroundColor: "white", borderBottom: "1px solid #dcdcdc", backgroundImage: reciever.name_reciever ? `url(${backgroundImg})` : ``, backgroundSize: "cover" }}>
                        {conversationId ? (
                            messages.length === 0 ? (
                                <p style={{ marginTop: "30px", fontWeight: "600", color: "white" }}>Edo okati okati cheppu!</p>
                            ) : (
                                messages.map(({ senderId, messages, _id }) => {
                                    // Render messages based on senderId
                                    const isMyMessage = senderId === userDetails.uid;

                                    return (
                                        <div key={_id}>
                                            <div
                                                className={`mb-4 ${isMyMessage ? 'my-4' : 'mx-3'}`}
                                                style={{
                                                    minHeight: "50px",
                                                    width: "300px",
                                                    backgroundColor: isMyMessage ? "#009688" : "#4DB6AC",
                                                    borderTopLeftRadius: isMyMessage ? "35px" : "0",
                                                    borderTopRightRadius: isMyMessage ? "0" : "35px",
                                                    borderBottomRightRadius: "35px",
                                                    borderBottomLeftRadius: "35px",
                                                    marginLeft: isMyMessage ? "auto" : "0",
                                                    marginRight: isMyMessage ? "20px" : "0",
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    padding: "15px",
                                                    color: "white",
                                                }}
                                            >
                                                {messages}
                                            </div>
                                            <div style={{ color: "white" }} ref={scrolldown}></div>
                                        </div>
                                    );
                                })
                            )
                        ) : (
                            <div style={{ marginTop: "70px", fontWeight: "600", color: "#388E3C", fontSize: "18px", textAlign: "center", textShadow: "1px 1px 2px rgba(79, 195, 247, 0.3)" }}>
                                Switch to some user to open conversations
                            </div>
                        )}
                    </div>
                    {reciever.name_reciever &&
                        <div className="input-group" style={{ height: "50px" }}>
                            <input type="textArea" className="form-control" placeholder="Type your message" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                            <div className="input-group-append">
                                <button className="btn btn-outline-primary btn-sm" type="button" onClick={() => sendMessage()} disabled={newMessage.length > 0 && conversationId ? false : true}>Send</button>
                            </div>
                        </div>
                    }
                </div>
                <div className='w-25' style={{ height: "100vh", backgroundColor: "#e0ffff" }}>
                    <div>
                        <h3 className='w-75 my-4' style={{
                            margin: "auto",
                            fontWeight: "500", fontSize: "18px", backgroundColor: "#3A83C9",
                            padding: "10px", borderRadius: "17px",
                            color: "white"
                        }}>New Members you can add!!</h3>
                        <hr />
                        {
                            users.length === 0 ? <p style={{ marginTop: "30px", fontWeight: "600", fontSize: "15px" }}>Evaru leru le lite tisko!</p> :
                                users.map(({ userDetails, UserId }) => {
                                    return (
                                        <div onClick={() => newUsers(UserId)} className='my-4 mx-4' style={{ display: "flex", borderBottom: "1px solid #dcdcdc", padding: "10px", cursor: "pointer" }} key={UserId} >
                                            <div>
                                                <img src={profile} alt='Not found' height={50} width={50} style={{ borderRadius: "50%" }} />
                                            </div>
                                            <div style={{ marginLeft: "18px", textAlign: "left" }}>
                                                <h3 style={{ fontSize: "18px" }}>{userDetails.name}</h3>
                                                <p style={{ fontSize: "15px" }}>{userDetails.email}</p>
                                            </div>
                                        </div>
                                    )
                                })
                        }
                    </div>
                </div>
            </div >
        </>
    )
}

export default MessagingFile


