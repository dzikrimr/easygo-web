import axios from "axios";

const API_URL = "https://easygo-api-production-d477.up.railway.app/api";

const getAuthHeaders = () => {
  const auth_header = localStorage.getItem("auth_header");
  if (!auth_header) {
    console.error("No auth_header found in localStorage");
  }
  return {
    headers: {
      Authorization: `Bearer ${auth_header}`,
    },
  };
};

export const getChatRooms = () => {
  console.log("Fetching chat rooms");
  return axios.get(`${API_URL}/chat`, getAuthHeaders());
};

export const createChatRoom = (userId) => {
  console.log("Creating chat room with user:", userId);
  return axios.post(`${API_URL}/chat`, { user_id: userId }, getAuthHeaders());
};

export const getMessages = (chatRoomId) => {
  console.log("Fetching messages for chatRoomId:", chatRoomId);
  return axios.get(`${API_URL}/chat/${chatRoomId}/messages`, getAuthHeaders());
};

export const sendMessage = (chatRoomId, message) => {
  console.log("Sending message:", { chatRoomId, message });
  return axios.post(
    `${API_URL}/chat/${chatRoomId}/messages`,
    { message },
    getAuthHeaders()
  );
};

export const searchMessages = (keyword) => {
  console.log("Searching messages with keyword:", keyword);
  return axios.post(
    `${API_URL}/chat/messages/search`,
    { keyword },
    getAuthHeaders()
  );
};
