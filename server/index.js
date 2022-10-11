const express = require('express');
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server,{
    cors: {
        origin: "http://localhost:3000",
        method: ["GET", "POST"]
    }
})

var listRooms = [];
var listUsers = [];
var messageList = [];

io.on("connection", (socket) =>{

    
    console.log(socket.id);

    socket.on("fetch_user_unique", (user) => {
        if (!listUsers.includes(user)){

            //Only push if room unique too..
            console.log("user " + user + " is unique");
            const user_unique = true;
            socket.emit("return_user_unique", user_unique);
        } else {
            const user_unique = false;
            socket.emit("return_user_unique", user_unique);
        }
    })

    socket.on("fetch_room_unique", ({roomname_typed_by_user, user}) => {
        if (!listRooms.includes(roomname_typed_by_user)){
            console.log("room: " + roomname_typed_by_user + " is unique");
            //Both room and user unique so can make note of this.
            listUsers.push(user);
            const roomUnique = true;
            socket.emit("return_room_unique", roomUnique);
        } else {
            const roomUnique = false;
            socket.emit("return_room_unique", roomUnique);
        }
    })

    

    //These rooms will be passed to useEffect 
    //On page render. 
    
    //This currently renders twice.
    //So the rooms are passed
    socket.on("fetch_room_list", () => {
        console.log("returning the list of rooms");
        socket.emit("return_room_list", listRooms);
    }) 
-
    socket.on("join_room", ({roomname_typed_by_user, user}) => {
        // User Joins
        // Other Users Notified
        // Previous Messages In Server Storage Sent To New User
        //

        //We can keep tabs on which
        //rooms ids exist
        if (!listRooms.includes(roomname_typed_by_user)){
            console.log("Room " + roomname_typed_by_user + " was pushed to listRooms.")
            listRooms.push(roomname_typed_by_user);
            socket.broadcast.emit("room_created", roomname_typed_by_user);
        }

        socket.join(roomname_typed_by_user);
        socket.emit();

        //if (previous_messageList.length > 0){
        //Pass all previous messages to user that
        //has just joined the chat.
    
        const send_messages_to_new_user = () => {
            if (messageList.length > 0){
                
                console.log("The list of messages on the server is larger than 0.");

                const messages_in_room_list = messageList.filter((item) => {
                    return item.roomname_typed_by_user == roomname_typed_by_user;
                });

                console.log("The number of messages that belong to room " + roomname_typed_by_user + " is " + messages_in_room_list.length + ".");
                
                if (messages_in_room_list.length > 0){
                    console.log("message list is being passed to the new room user");
                    console.log(messages_in_room_list);
                    console.log(messages_in_room_list);
                    //Only the user
                    socket.emit("previous_messages_in_room", (messages_in_room_list));
                    console.log("messages were sent to the user which just joined the room.");
                    
                    return;
                }
            }   
        }

        send_messages_to_new_user();
        

        
        const message = `user with ID: ${socket.id} joined room ${roomname_typed_by_user}`;
        console.log(message);

        const fetchUsersInRoom = async () => {
                const roomUsers = await io.in(roomname_typed_by_user).allSockets();
                roomUsers.forEach(socket => {
                console.log("user " + socket + " is in room" + roomname_typed_by_user);
            });
                return roomUsers.size;
        
        }


    fetchUsersInRoom().then(user_count_in_room => {
        console.log("THERE ARE " + user_count_in_room + "USERS IN THE ROOM");

        if (user_count_in_room > 0){
            
            console.log("There are still " + user_count_in_room + " connections in the room.")

            const user_left_room = "user " + user + " has joined the room";
            const dict = {
                author: "", 
                message: user_left_room, 
                time: new Date().toLocaleString()
            };
            socket.to(roomname_typed_by_user).emit("receive_message", dict);

            
        };

        socket.broadcast.emit("user joined", message);
        
    });


    
        
    })

    socket.on("send_message", (data) => {
        console.log(data);
        messageList.push(data);
        console.log(messageList);
        console.log("message has been added to array");
        socket.to(data.roomname_typed_by_user).emit("receive_message", data);
    });

    socket.on("disconnect_from_room", async ({roomname_typed_by_user, user}) =>{

        socket.leave(roomname_typed_by_user);
        
        console.log("user: " + user + " is being removed from server list");

        listUsers = listUsers.filter((item) => {
            return item !== user;
        });


        const fetchUsersInRoom = async () => {
                const roomUsers = await io.in(roomname_typed_by_user).allSockets();
                //console.log("Room has users: " + roomUsers.size + " in it.");
                return roomUsers.size;
            };

        const user_count_in_room = await fetchUsersInRoom();
       
        if (user_count_in_room > 0){
            
            console.log("There are still " + user_count_in_room + " connections in the room.")

            const user_left_room = "user " + user + " has left the room";
            const dict = {
                author: "", 
                message: user_left_room, 
                time: new Date().toLocaleString()
            };
            socket.to(roomname_typed_by_user).emit("receive_message", dict);
 
            //We do not need to broadcast a change in number of rooms.
            //Broadcast user leaves room.

            //Broadcast room shuts to users not in any rooms + update list
        
        } else {

            listRooms = listRooms.filter((item) => {
                return item !== roomname_typed_by_user;
            });

            //remove all comments which belong to a room.
            messageList = messageList.filter((item) => {
                return item.roomname_typed_by_user !== roomname_typed_by_user
            })
            
            console.log("Room has nobody in it, so we must shut it down.")
            console.log(listRooms);

            
            const emitReducedRoomList = async () => {

                socket.emit("return_reduced_room_list", listRooms);

            }


            const broadcastReducedRoomList = async () => {

                socket.broadcast.emit("return_reduced_room_list", listRooms);
            
            }

            await emitReducedRoomList();
            await broadcastReducedRoomList();
            
            
        }

        //socket.emit("return_room_list", listRooms);


        //When room_list = 0 then greeting displayed
        //This occurs when other user still in room...
        //socket.broadcast.emit("return_room_list", listRooms);

        //const user_that_left = socket.id;
        //const user_left_room = "user " + user_that_left + " has left the room";
        //socket.to(room).emit('user_left', user_left_room);
    });
});

server.listen(3001, () => {
    console.log("SERVER IS RUNNING");
});