// test-socket-client.js
const { io } = require("socket.io-client");
const axios = require("axios");

const SERVER = "http://localhost:5000"; // <-- chắc chắn cùng port với server log
const NAMESPACE = "/inventory-socket";
const socket = io(`${SERVER}${NAMESPACE}`);

socket.on("connect", () => {
  console.log("Connected socket id:", socket.id);
  socket.emit("subscribeToProducts", { productIds: ["id1", "id2"] });
});

socket.on("inventoryUpdate", (data) => {
  console.log("Received inventoryUpdate:", data);
});

socket.on("connect_error", (err) => {
  console.error("connect_error", err.message);
});

// Gọi HTTP broadcast sau 2s
setTimeout(async () => {
  try {
    const res = await axios.post(`${SERVER}/v1/broadcast-test`, {
      productId: "id1",
      newStock: "5",
    });
    console.log("HTTP broadcast result:", res.data);
  } catch (err) {
    console.error("HTTP broadcast failed:", err.message);
  }
}, 2000);
