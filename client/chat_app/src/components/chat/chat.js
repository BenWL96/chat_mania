import React, {useEffect, useState} from 'react';
import "./chat.css";

function Chat({socket, username, roomname_typed_by_user}) {
     {/*previous_message_list*/}

    const [currentMessage, setCurrentMessage] = useState(null);
    const [messages, setMessages] = useState([]);
    const [displayEmptyRoomMessagePrompt, setDisplayEmptyRoomMessagePrompt] = useState(true);

    const Send_Message = async () => {
        if (currentMessage !== "" && roomname_typed_by_user && currentMessage !== null){

            setDisplayEmptyRoomMessagePrompt(false);

            const data = {
                roomname_typed_by_user: roomname_typed_by_user,
                author: username,
                message: currentMessage,
                time: new Date().toLocaleString()
            }
            
            //first add post to messages...
            setMessages((list) => [...list, data]);
            await socket.emit("send_message", data);

        }
        
    };


    useEffect(() => {

        //We could have similar code which notifies when a user has joined the room.

        socket.off('receive_message').on("receive_message", (user_left_room) => {
            setDisplayEmptyRoomMessagePrompt(false);
            setMessages((list) => [...list, user_left_room]);
        });


        //If user has sent a message or received a message
        //Then don't append all chatroom messages



        socket.off("previous_messages_in_room").on("previous_messages_in_room", (messages_in_room_list) => {
            
            // Second user that joins the room should be passed
            // The previous messages that First user sent.
            
            if (messages.length == 0){
                if (messages_in_room_list.length > 0) {
                    setDisplayEmptyRoomMessagePrompt(false);
                }
            }

            console.log("MESSAGES HAVE BEEN RECEIVED BY ROOM");
            console.log(messages_in_room_list);
            messages_in_room_list.map((msg) => {
            setMessages((list) => [...list, msg]);
            })
        });

        if (messages.length > 0){
            setDisplayEmptyRoomMessagePrompt(false);
        } else {
            setDisplayEmptyRoomMessagePrompt(true);
        }
        

          },[socket]);
 
        
    

    //on page load we should load all of the messages in the room
    //we should put limit of users at 2


    return (

        <div>

            
            <div className='chat_header'>
                You are currently in room: {roomname_typed_by_user}
            </div>
            <div className='chat_body'>

                {displayEmptyRoomMessagePrompt == true ? <><p className='chat_body_prompt'>Be the first to start a conversation... </p></> : <></>}

                {messages.map((messageContent) => {
                    const key = messageContent.author + " " + messageContent.time

                    if (messageContent.author == username){
                    return (
                        
                            <div key={key} className='row message_row'>
                               
                               <div className='col message_col'>
                                    <p className="chat_body_row_col_time">
                                        {messageContent.time}
                                    </p>
                                </div> 
                                
                                <div className='message_row_first_person_wrapper'>
                                    <div className='col message_col'>
                                        <p className="chat_body_row_col_auth">
                                            user : {messageContent.author}
                                        </p>
                                    </div>
                                    <div className='col message_col'>
                                        <p className="chat_body_row_col_msg">
                                            " {messageContent.message} "
                                        </p>
                                    </div>
                                </div>
                            </div>
                   
                    )} else {

                        return (

                        
                            <div key={key} className='row message_row'>


                                <div className='col message_col'>
                                    <p className="chat_body_row_col_time">
                                        {messageContent.time}
                                    </p>
                                </div>

                                <div className='message_row_third_person_wrapper'>
                                    <div className='col message_col'>
                                        <p className="chat_body_row_col_auth">
                                            user : {messageContent.author}
                                        </p>
                                    </div>

                                    <div className='col message_col'>
                                        <p className="chat_body_row_col_msg">
                                            " {messageContent.message} "
                                        </p>
                                    </div>
                                </div>

                                
                            </div>

                    )}
                })}
            </div>
            <div className='chat_footer'>
                <input type="text" className="chat_footer_input" placeholder='type your message' onChange={(entry) => setCurrentMessage(entry.target.value)}/>
                <button onClick={Send_Message} className="chat_footer_send_button">Send</button>
            </div>

          
        </div>
    );
}

export default Chat;