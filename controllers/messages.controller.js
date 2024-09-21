const {getConnection} = require('../db/connectDb');

const sendMessage = async (req, res) => {
    const { groupId, userId, messageText } = req.body;
  
    try {
      const connection = await getConnection();
      const insertQuery = `
        INSERT INTO messages (groupId, userId, messageText)
        VALUES (?, ?, ?)
      `;
      await connection.query(insertQuery, [groupId, userId, messageText]);
  
      res.status(201).json({ message: "Message sent successfully." });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  const getMessages = async (req, res) => {
    const { groupId } = req.params;
  
    try {
      const connection = await getConnection();
      const fetchQuery = `
        SELECT m.*, u.name as senderName
        FROM messages m
        JOIN user u ON m.userId = u.userId
        WHERE m.groupId = ?
        ORDER BY m.timestamp DESC
      `;
      const [messages] = await connection.query(fetchQuery, [groupId]);
  
      res.json({ messages });
    } catch (error) {
      console.error("Error retrieving messages:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  const updateMessage = async (req, res) => {
    const { messageId } = req.params;
    const { userId, messageText } = req.body; // Include userId in the body for authorization purposes
  
    try {
      const connection = await getConnection();
      const updateQuery = `
        UPDATE messages
        SET messageText = ?
        WHERE id = ? AND userId = ?  // Ensures that only the sender can update their message
      `;
      const [result] = await connection.query(updateQuery, [messageText, messageId, userId]);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "No message found or you do not have permission to update this message" });
      }
  
      res.json({ message: "Message updated successfully" });
    } catch (error) {
      console.error("Error updating message:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  const deleteMessage = async (req, res) => {
    const { messageId } = req.params;
    const { userId } = req.body; // Include userId in the body for authorization purposes
  
    try {
      const connection = await getConnection();
      const deleteQuery = `
        DELETE FROM messages
        WHERE id = ? AND userId = ?  // Ensures that only the sender can delete their message
      `;
      const [result] = await connection.query(deleteQuery, [messageId, userId]);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "No message found or you do not have permission to delete this message" });
      }
  
      res.json({ message: "Message deleted successfully" });
    } catch (error) {
      console.error("Error deleting message:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  
  
  
  module.exports = {sendMessage,getMessages,updateMessage,deleteMessage};