import { useState, useEffect, useCallback } from "react";
import { getChatRooms } from "../services/chatService";
import { getPusherInstance } from "../utils/pusher";

export const useChatRooms = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const updateChatRoom = useCallback((newMessage) => {
    setChatRooms((prevRooms) => {
      const updatedRooms = prevRooms.map((room) => {
        if (room.chat_room_id === newMessage.chat_room_id) {
          return {
            ...room,
            last_message: {
              message: newMessage.message,
              created_at: newMessage.created_at,
              sender_id: newMessage.sender_id,
            },
          };
        }
        return room;
      });
      return updatedRooms.sort((a, b) => {
        const dateA = a.last_message?.created_at
          ? new Date(a.last_message.created_at)
          : new Date(0);
        const dateB = b.last_message?.created_at
          ? new Date(b.last_message.created_at)
          : new Date(0);
        return dateB - dateA;
      });
    });
  }, []);

  const addChatRoom = useCallback((newRoom) => {
    setChatRooms((prevRooms) => {
      if (
        prevRooms.some((room) => room.chat_room_id === newRoom.chat_room_id)
      ) {
        console.log("Room already exists:", newRoom.chat_room_id);
        return prevRooms;
      }
      const updatedRooms = [newRoom, ...prevRooms];
      return updatedRooms.sort((a, b) => {
        const dateA = a.last_message?.created_at
          ? new Date(a.last_message.created_at)
          : new Date(0);
        const dateB = b.last_message?.created_at
          ? new Date(b.last_message.created_at)
          : new Date(0);
        return dateB - dateA;
      });
    });
  }, []);

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        setLoading(true);
        const res = await getChatRooms();
        const validRooms = res.data.filter((room) => {
          if (!room.chat_room_id) {
            console.warn("Invalid room detected:", room);
            return false;
          }
          return true;
        });
        setChatRooms(
          validRooms.sort((a, b) => {
            const dateA = a.last_message?.created_at
              ? new Date(a.last_message.created_at)
              : new Date(0);
            const dateB = b.last_message?.created_at
              ? new Date(b.last_message.created_at)
              : new Date(0);
            return dateB - dateA;
          })
        );
      } catch (err) {
        console.error("Error fetching chat rooms:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChatRooms();
  }, []);

  useEffect(() => {
    const pusher = getPusherInstance();
    const userId = window.localStorage.getItem("user_id");
    if (!userId) {
      console.warn(
        "No user_id found in localStorage, skipping user channel subscription"
      );
      return;
    }

    // Subscribe to user-specific channel for new room creation
    const userChannel = pusher.subscribe(`chat-room.${userId}`);
    userChannel.bind("room-created", (data) => {
      console.log(
        "New room created via Pusher:",
        JSON.stringify(data, null, 2)
      );
      if (data) {
        addChatRoom({
          chat_room_id: data.chat_room_id,
          user1: data.user1,
          user2: data.user2,
          last_message: data.last_message,
        });
      }
    });

    // Subscribe to message updates for preview list
    const channels = {};
    chatRooms.forEach((room) => {
      if (!room.chat_room_id) {
        console.warn("Skipping subscription for invalid room:", room);
        return;
      }
      const channelName = `chat-room-message.${room.chat_room_id}`;
      channels[channelName] = pusher.subscribe(channelName);

      channels[channelName].bind("new-message", (data) => {
        console.log(
          "Pusher event for chat room:",
          room.chat_room_id,
          JSON.stringify(data, null, 2)
        );
        if (data?.message) {
          updateChatRoom({
            chat_room_id: data.message.chat_room_id,
            message: data.message.message,
            created_at: data.message.created_at,
            sender_id: data.message.sender_id,
          });
        }
      });

      console.log("Subscribed to channel:", channelName);
    });

    return () => {
      Object.keys(channels).forEach((channelName) => {
        channels[channelName].unbind_all();
        pusher.unsubscribe(channelName);
        console.log("Unsubscribed from channel:", channelName);
      });
      userChannel.unbind_all();
      pusher.unsubscribe(`chat-room.${userId}`);
      console.log("Unsubscribed from user channel:", `chat-room.${userId}`);
    };
  }, [chatRooms, updateChatRoom, addChatRoom]);

  return { chatRooms, loading, updateChatRoom, addChatRoom };
};
