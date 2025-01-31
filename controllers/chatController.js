const Message = require('../models/messageModel');

// Save a new message to the database
const sendMessage = async (req, res) => {
    try {
      const { sender, receiver, text } = req.body;
  
      // Assuming you have a Message model to store messages
      const message = new Message({ sender, receiver, text });
      await message.save();
  
      // Respond with a success message
      res.status(201).json({ message: 'Message sent successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  };

// Get chat history between two users
const getChatHistory = async (req, res) => {
  try {
    const { sender, receiver } = req.params;
    const messages = await Message.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
    }).sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching chat history', error: err });
  }
};
module.exports = { sendMessage, getChatHistory };