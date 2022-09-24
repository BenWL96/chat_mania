import { useEffect, useState } from "react";

import Chat from '../chat/chat';

import io from 'socket.io-client';
const socket = io.connect("http://localhost:3001");


function Body() {


    const [user, setUser] = useState(null);
    const [roomname_typed_by_user, setRoomName_Typed_By_User] = useState(null);
    const [roomJoined, setRoomJoined] = useState(false);
    const [list_of_rooms_active, setList_Of_Rooms_Active] = useState([]);
    const [greeting_message, setGreeting_Message] = useState(null);
    const [error_messages, setError_Messages] = useState([]);
    const [display_room_clicked_user_input, setDisplay_Room_Clicked_User_Input] = useState(false);
    const [hide_rooms_and_join_chat, setHide_Rooms_And_Join_Chat] = useState(false);
    //const [prev_msges, setPrev_Msges] = useState([]);
  
    const leaveRoom = async () => {

    // User leaves the room, so disconnect and notify other users in room.

    console.log("user click leave");
    setHide_Rooms_And_Join_Chat(false);
    setRoomJoined(false);
    setRoomName_Typed_By_User(null);
    setDisplay_Room_Clicked_User_Input(false);

    await socket.emit("disconnect_from_room", ({roomname_typed_by_user: roomname_typed_by_user, user: user}));
    
    //Here we need to update the list of rooms.
    //list_of_rooms_active

  };

  const joinRoom = () => {

    
    if ( user !== "" && roomname_typed_by_user !== "" && user !== null && roomname_typed_by_user !== null ){

      // No errors can exist if we are this far.
      console.log("user and room are not null.");

      setError_Messages([]);
        
        
        socket.emit("fetch_user_unique", user);
        socket.on("return_user_unique", (user_unique) => {

            if (user_unique === true){

              //Check that user is unique, if so continue

              console.log("User is unique: " + user_unique + ".");

              socket.emit("fetch_room_unique", ({roomname_typed_by_user: roomname_typed_by_user, user: user}));

              // Now check whether Room entered is unique
              // If not display error.

                socket.on("return_room_unique", (room_unique) => {

                  if (room_unique === true){

        
                    console.log("Room is unique.")
                    socket.emit("join_room", roomname_typed_by_user);
                    setRoomJoined(true);
                    setGreeting_Message(null);
                    setError_Messages([]);
                    setDisplay_Room_Clicked_User_Input(false);
                    
                    // Here We Could Hook Up A Database To Check
                    // Whether Previous Messages Exist In The Room
                  

                  }else {
                    if (display_room_clicked_user_input == false){
                    const room_not_unique_msg = "Sorry but the room name already exists. Try creating another room";
                    console.log(room_not_unique_msg);
                    if (!error_messages.includes(room_not_unique_msg)){
                      setError_Messages((list) => [...list, room_not_unique_msg]);
                      }
                    }else{

                      //async carry out function n shit;
                      const nthUserJoinsRoom = async () => {
                        await socket.emit("join_room", roomname_typed_by_user);
                      }
                      setDisplay_Room_Clicked_User_Input(false);
                      setRoomJoined(true);
                      setGreeting_Message(null);
                      setError_Messages([]);
                      nthUserJoinsRoom();

                    }
                    //setError_Message((list) => [...list, room_not_unique_msg])
                  }
          
              }); 


            }else {
              const name_not_unique_msg = "Sorry but the name already exists in a chatroom. Try another Name.";
              console.log(name_not_unique_msg);
              if (!error_messages.includes(name_not_unique_msg)){
                setError_Messages((list) => [...list, name_not_unique_msg]);
              }
            }
        }); 

    } else {

      // One of the inputs are incorrect
      // Display appropriate message

      console.log("Please enter a valid username and room name.");
      setError_Messages(["Please enter a valid username and room name."])

    }
  }


  useEffect(() => {

    //If user allocated a socket already, then prevent
    //running loop multiples.
    

    console.log("Fetching rooms..");
    //On page load determine if there are any rooms
    //React renders the component twice due to StrictMode.
    
    socket.emit("fetch_room_list");

    socket.off('return_room_list').on("return_room_list", (list_rooms) => {
      console.log("list of rooms:" + list_rooms);
      console.log("There are " + list_rooms.length + " rooms.")
      //Check if rooms exist in state!!
      if (!list_rooms.length == 0){
        //This doesn't work..
        console.log("room(s) exist proceed to mapping");
        list_rooms.map((roomname_typed_by_user) => {
        if (!list_of_rooms_active.includes(roomname_typed_by_user)){
          console.log("room number: " + roomname_typed_by_user + " was pushed to the state.");
          setList_Of_Rooms_Active((list) => [...list, roomname_typed_by_user]);
        }})
        
        if (roomJoined == false){
          setHide_Rooms_And_Join_Chat(false);
          setRoomName_Typed_By_User(null);
          setDisplay_Room_Clicked_User_Input(false);
        }} else {
          setList_Of_Rooms_Active([]);
          console.log("There are no rooms, so please create a room");
          setGreeting_Message("Please create a room!");
          setHide_Rooms_And_Join_Chat(false);
          //Currently when user leaves room they can't receive messages
          //any more, but they can still post messages due to the state..
          setRoomJoined(false);
          setRoomName_Typed_By_User(null);
          setDisplay_Room_Clicked_User_Input(false);
        } 
      });

      //Check to see if a room has been created, make sure
      //Other users on server can see this
      socket.on("room_created", (roomname_typed_by_user) => {
        if (!list_of_rooms_active.includes(roomname_typed_by_user)){
          setList_Of_Rooms_Active((list) => [...list, roomname_typed_by_user]);
        }
      });
      
      //Check to make sure that the list of rooms are
      //Updating.
      socket.on("return_reduced_room_list", (list_rooms) => {
        console.log("Checking if room list needs to be updated.")
        console.log(list_rooms);
        setList_Of_Rooms_Active(list_rooms);
      });

    },[socket]); 
    
      const EnterRoomByClick = (room_name) => {
        //User has clicked on a room number
        //Now they should select a unique username on the server to join a room.
        console.log("Room number " + room_name + " was clicked.");
        setHide_Rooms_And_Join_Chat(true);
        setError_Messages([]);
        setRoomName_Typed_By_User(room_name);
        setDisplay_Room_Clicked_User_Input(true);
      }
    
      const UserClicksBack = async () => {
        //Disconnect from room, and shut down room if not existent.
        await socket.emit("disconnect_from_room", ({roomname_typed_by_user : roomname_typed_by_user, user: user}));
        setDisplay_Room_Clicked_User_Input(false);
        setHide_Rooms_And_Join_Chat(false);
        setRoomName_Typed_By_User(null);

      }

  //Useeffect on page load to see how many rooms exist
  //If rooms > 0 then render list
  //Else user picks a room.


    return (
        <div>

            {/*Code Below Must Be New Component*/}


      {!error_messages.length > 0 ? <></> : <> {error_messages.map((error) => {
        return <div key={error}>{error}</div>
      })} </>}



      {list_of_rooms_active.length != 0 && roomJoined == false && hide_rooms_and_join_chat == false ? <>Select A Room Below</> : <></>}
      {/*User hasn't yet joined the room, but they have clicked the room number */}
      {/*We must only show the list of rooms, if all false*/}
      {list_of_rooms_active.length != 0 && roomJoined == false && hide_rooms_and_join_chat == false ? <> {list_of_rooms_active.map((room_name) => {
        return <div className="clickable_room_name" key={room_name} onClick={() => EnterRoomByClick(room_name)}>{room_name}</div>
      
      })} </> : <></>}

      {/*We must only show the greeting message if , if all evaluate to true*/}
      {list_of_rooms_active.length == 0 && roomJoined == false && hide_rooms_and_join_chat == false ? <>{greeting_message}</> : <></>}

      {/*only display room input if criteria met.*/}
      {hide_rooms_and_join_chat == false && !roomJoined ? <><h2>Join A Chat</h2>
      <input type="text" placeholder="Type A User Name Here" onChange={(entry) => {setUser(entry.target.value)}}/>
      <input type="text" placeholder="Type A Room Name Here" onChange={(entry) => {setRoomName_Typed_By_User(entry.target.value)}}/>
      <button onClick={joinRoom}>Join A Room</button>
      </> : <></>}

  
      {display_room_clicked_user_input ? <>
        <h2>Select a name for room {roomname_typed_by_user}</h2>
        
      <input type="text" placeholder="Type A User Name Here" onChange={(entry) => {setUser(entry.target.value)}}/>
      <button onClick={joinRoom}>Join A Room</button>
      <button onClick={UserClicksBack}>Or Go Back</button>
      </> : <></> }


      {!roomJoined ?
      
      <></> : <><button onClick={leaveRoom}>Leave Room</button> <Chat socket={socket} username={user} roomname_typed_by_user={roomname_typed_by_user}/></>
      }   

            
        </div>
    );
}

export default Body;