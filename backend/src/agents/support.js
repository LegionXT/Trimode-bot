const Ticket = require("../models/Ticket");

exports.handle = async (message, userId) => {
  const ticket = new Ticket({
    userId,
    issue: message,
    status: "open"
  });

  await ticket.save();

  return {
    text: `Thanks! I’ve created a support ticket for you.\nTicket ID: ${ticket._id}\nOur team will get back to you soon.`
  };
};
