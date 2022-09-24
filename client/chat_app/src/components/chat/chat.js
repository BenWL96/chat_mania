import React, {useEffect, useState} from 'react';

function Chat({socket, username, roomname_typed_by_user}) {
     {/*previous_message_list*/}

    const [current_message, setCurrent_Message] = useState(null);
    const [messages, setMessages] = useState([]);

    const Send_Message = async () => {
        if (current_message !== "" && roomname_typed_by_user){
            const data = {
                roomname_typed_by_user: roomname_typed_by_user,
                author: username,
                message: current_message,
                time: new Date().toLocaleString()
            }
            
            //first add post to messages...
            setMessages((list) => [...list, data]);
            await socket.emit("send_message", data);
        }
    };


    useEffect(() => {

        //If user has sent a message or received a message
        //Then don't append all chatroom messages
        if (messages.length >= 0){
            socket.off('receive_message').on("receive_message", (user_left_room) => {
                setMessages((list) => [...list, user_left_room]);
            });
        } else {
            //User has just joined the chatroom, so pass
            //Then all the messages that exists.
            //setMessages((list) => [...list, previous_message_list]);
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
                {messages.map((messageContent) => {
                    const key = messageContent.author + " " + messageContent.time
                    return (
                        
                            <div key={key} className='row message_row'>
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
                                <div className='col message_col'>
                                    <p className="chat_body_row_col_time">
                                        {messageContent.time}
                                    </p>
                                </div>
                            </div>
                   
                    )
                })}
            </div>
            <div className='chat_footer'>
                <input type="text" placeholder='type your message' onChange={(entry) => setCurrent_Message(entry.target.value)}/>
                <button onClick={Send_Message}>Send</button>
            </div>

          
        </div>
    );
}

export default Chat;