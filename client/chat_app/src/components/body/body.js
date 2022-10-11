import { useEffect, useState } from "react";

import Chat from '../chat/chat';

import io from 'socket.io-client';
const socket = io.connect("http://localhost:3001");


function Body() {


    const [user, setUser] = useState(null);
    const [roomname_typed_by_user, setRoomNameTypedByUser] = useState(null);
    const [roomJoined, setRoomJoined] = useState(false);
    const [listOfRoomsActive, setListOfRoomsActive] = useState([]);
    const [greetingMessage, setGreetingMessage] = useState(null);
    const [errorMessages, setErrorMessages] = useState([]);
    const [displayRoomClickedUserInput, setDisplayRoomClickedUserInput] = useState(false);
    const [hideRoomsAndJoinChat, setHideRoomsAndJoinChat] = useState(false);


    const disconnectFromRoomEmit = async () => {

      await socket.emit("disconnect_from_room", ({roomname_typed_by_user: roomname_typed_by_user, user: user}));

    }

    const userLeavesRoomUpdateState = () => {
      console.log("user click leave");
      setHideRoomsAndJoinChat(false);
      setRoomJoined(false);
      setRoomNameTypedByUser(null);
      setDisplayRoomClickedUserInput(false);

    }
    const leaveRoom = async () => {

    // User leaves the room, so disconnect and notify other users in room.
    userLeavesRoomUpdateState();
    disconnectFromRoomEmit();
    
  };

  const nthUserJoinsRoom = async () => {
    await socket.emit("join_room", roomname_typed_by_user);
  }

  const secondUserJoinsRoomSetState = () => {

    setDisplayRoomClickedUserInput(false);
    setRoomJoined(true);
    setGreetingMessage(null);
    setErrorMessages([]);

    nthUserJoinsRoom();

  }

  const joinRoomEmit = () => {
    socket.emit("join_room", roomname_typed_by_user);
  }

  const roomNameUniqueSetState = () => {
    
    console.log("Room is unique.")
    joinRoomEmit();

    setRoomJoined(true);
    setGreetingMessage(null);
    setErrorMessages([]);
    setDisplayRoomClickedUserInput(false);
  }

  const ifRoomNameIsUniqueThenListRoom = (roomUnique) =>{

    if (roomUnique === true){
      
      roomNameUniqueSetState();

      // Here We Could Hook Up A Database To Check
      // Whether Previous Messages Exist In The Room

    }else {
      if (displayRoomClickedUserInput == false){
      const room_not_unique_msg = "Sorry but the room name already exists. Try creating another room";
      console.log(room_not_unique_msg);
      if (!errorMessages.includes(room_not_unique_msg)){
        setErrorMessages((list) => [...list, room_not_unique_msg]);
        }
      }else{

        secondUserJoinsRoomSetState();

      }
      //setError_Message((list) => [...list, room_not_unique_msg])
    }
  }

  const userUniqueThenCheckRoomUnqiueElseDisplayError = (user_unique) => {
    if (user_unique === true){

      //Check that user is unique, if so continue

      console.log("User is unique: " + user_unique + ".");

      socket.emit("fetch_room_unique", ({roomname_typed_by_user: roomname_typed_by_user, user: user}));

      // Now check whether Room entered is unique
      // If not display error.

        socket.on("return_room_unique", (roomUnique) => {

          ifRoomNameIsUniqueThenListRoom(roomUnique);
  
      }); 


    }else {
      const name_not_unique_msg = "Sorry but the name already exists in a chatroom. Try another Name.";
      console.log(name_not_unique_msg);
      if (!errorMessages.includes(name_not_unique_msg)){
        setErrorMessages((list) => [...list, name_not_unique_msg]);
      }
    }
  }

  const joinRoom = () => {

    
    if ( user !== "" && roomname_typed_by_user !== "" && user !== null && roomname_typed_by_user !== null ){

      // No errors can exist if we are this far.
      console.log("user and room are not null.");

      setErrorMessages([]);
      
      
        
        socket.emit("fetch_user_unique", user);
        socket.on("return_user_unique", (user_unique) => {

            userUniqueThenCheckRoomUnqiueElseDisplayError(user_unique);
        }); 

    } else {

      // One of the inputs are incorrect
      // Display appropriate message

      console.log("Please enter a valid username and room name.");
      setErrorMessages(["Please enter a valid username and room name."])

    }
  }

  const listOfRoomsIsZeroSoSetStateToReflectThis = () => {
    setListOfRoomsActive([]);
    console.log("There are no rooms, so please create a room");
    setGreetingMessage("Please create a room!");
    setHideRoomsAndJoinChat(false);
    //Currently when user leaves room they can't receive messages
    //any more, but they can still post messages due to the state..
    setRoomJoined(false);
    setRoomNameTypedByUser(null);
    setDisplayRoomClickedUserInput(false);
  }

  const receiveReturnReducedRoomListCheckLength = (listRooms) => {
    if (listRooms.length > 0) {
      console.log("Checking if room list needs to be updated.")
      console.log(listRooms);
      setListOfRoomsActive(listRooms);
    }else{
      setListOfRoomsActive([]);
      setGreetingMessage("Please create a room!");
    }
  }

  useEffect(() => {

    //If user allocated a socket already, then prevent
    //running loop multiples.
    

    console.log("Fetching rooms..");
    //On page load determine if there are any rooms
    //React renders the component twice due to StrictMode.
    
    socket.emit("fetch_room_list");

    socket.off('return_room_list').on("return_room_list", (listRooms) => {
      console.log("list of rooms:" + listRooms);
      console.log("There are " + listRooms.length + " rooms.")
      //Check if rooms exist in state!!
      if (!listRooms.length == 0){
        //This doesn't work..
        console.log("room(s) exist proceed to mapping");
        listRooms.map((roomname_typed_by_user) => {
        if (!listOfRoomsActive.includes(roomname_typed_by_user)){
          console.log("room number: " + roomname_typed_by_user + " was pushed to the state.");
          setListOfRoomsActive((list) => [...list, roomname_typed_by_user]);
        }})
        
        if (roomJoined == false){
          setHideRoomsAndJoinChat(false);
          setRoomNameTypedByUser(null);
          setDisplayRoomClickedUserInput(false);
        }} else {
          listOfRoomsIsZeroSoSetStateToReflectThis();
        } 
      });

      //Check to see if a room has been created, make sure
      //Other users on server can see this
      socket.on("room_created", (roomname_typed_by_user) => {
        if (!listOfRoomsActive.includes(roomname_typed_by_user)){
          setListOfRoomsActive((list) => [...list, roomname_typed_by_user]);
        }
      });
      
      //This checks to make sure that the list of rooms are updating.
      socket.on("return_reduced_room_list", (listRooms) => {
        receiveReturnReducedRoomListCheckLength(listRooms);
    });
    

    },[socket]); 
    
      const EnterRoomByClickSetState = (room_name) => {
        //User has clicked on a room number
        //Now they should select a unique username on the server to join a room.
        console.log("Room number " + room_name + " was clicked.");
        setHideRoomsAndJoinChat(true);
        setErrorMessages([]);
        setRoomNameTypedByUser(room_name);
        setDisplayRoomClickedUserInput(true);
      }
    
      const UserClicksBackSetState = async () => {

        setDisplayRoomClickedUserInput(false);
        setHideRoomsAndJoinChat(false);
        setRoomNameTypedByUser(null);

      }

  //Useeffect on page load to see how many rooms exist
  //If rooms > 0 then render list
  //Else user picks a room.


    return (
        <div>

            {/*Code Below Must Be New Component*/}


      {!errorMessages.length > 0 ? <></> : <> {errorMessages.map((error) => {
        return <div key={error}>{error}</div>
      })} </>}



      {listOfRoomsActive.length != 0 && roomJoined == false && hideRoomsAndJoinChat == false ? <>Select A Room Below</> : <></>}
      {/*User hasn't yet joined the room, but they have clicked the room number */}
      {/*We must only show the list of rooms, if all false*/}
      {listOfRoomsActive.length != 0 && roomJoined == false && hideRoomsAndJoinChat == false ? <> {listOfRoomsActive.map((room_name) => {
        return <div className="clickable_room_name" key={room_name} onClick={() => EnterRoomByClickSetState(room_name)}>{room_name}</div>
      
      })} </> : <></>}

      {/*We must only show the greeting message if , if all evaluate to true*/}
      {listOfRoomsActive.length == 0 && roomJoined == false && hideRoomsAndJoinChat == false ? <>{greetingMessage}</> : <></>}

      {/*only display room input if criteria met.*/}
      {hideRoomsAndJoinChat == false && !roomJoined ? <><h2>Join A Chat</h2>
      <input type="text" placeholder="Type A User Name Here" onChange={(entry) => {setUser(entry.target.value)}}/>
      <input type="text" placeholder="Type A Room Name Here" onChange={(entry) => {setRoomNameTypedByUser(entry.target.value)}}/>
      <button onClick={joinRoom}>Join A Room</button>
      </> : <></>}

  
      {displayRoomClickedUserInput ? <>
        <h2>Select a name for room {roomname_typed_by_user}</h2>
        
      <input type="text" placeholder="Type A User Name Here" onChange={(entry) => {setUser(entry.target.value)}}/>
      <button onClick={joinRoom}>Join A Room</button>
      <button onClick={UserClicksBackSetState}>Or Go Back</button>
      </> : <></> }


      {!roomJoined ?
      
      <></> : <><button onClick={leaveRoom}>Leave Room</button> <Chat socket={socket} username={user} roomname_typed_by_user={roomname_typed_by_user}/></>
      }   

            
        </div>
    );
}

export default Body;