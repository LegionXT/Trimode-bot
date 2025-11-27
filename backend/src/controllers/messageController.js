const { detectIntent } = require("../nlu/intentEngine");
const ecommerce = require("../agents/ecommerce");
const productivity = require("../agents/productivity");
const support = require("../agents/support");
const memoryService = require("../services/memoryService");

module.exports.handleMessage = async (req, res) => {
  try {
    const { userId, message } = req.body;

    console.log("Incoming:", message);

    if (!userId || !message) return res.status(400).json({ text: "Missing userId or message" });

    // --- Quick reset command ---
  if (message.toLowerCase() === "reset") {
  await memoryService.clearState(userId);
  return res.json({ text: "Memory cleared ✔️ Start fresh!" });
  }

    const mem = await memoryService.getMemory(userId);

   
    // If waiting on a field, handle it first
  if (mem?.awaiting?.field) {
  const field = mem.awaiting.field;

  // ecommerce handlers
  if (field === "size") {
    const reply = await ecommerce.handleSizeSelection(message, userId);
    await memoryService.recordBotMessage(userId, reply.text);
    return res.json(reply);
  }

  if (field === "confirm_checkout") {
    const reply = await ecommerce.handleCheckout(userId, message);
    await memoryService.recordBotMessage(userId, reply.text);
    return res.json(reply);
  }

  if (field === "payment") {
    const reply = await ecommerce.processPayment(userId, message);
    await memoryService.recordBotMessage(userId, reply.text);
    return res.json(reply);
  }

  // productivity handlers
  if (field === "meeting_date") {
    const reply = await productivity.handleDate(userId, message);
    await memoryService.recordBotMessage(userId, reply.text);
    return res.json(reply);
  }

  if (field === "meeting_time") {
    const reply = await productivity.handleTime(userId, message);
    await memoryService.recordBotMessage(userId, reply.text);
    return res.json(reply);
  }

  if (field === "meeting_duration") {
    const reply = await productivity.handleDuration(userId, message);
    await memoryService.recordBotMessage(userId, reply.text);
    return res.json(reply);
  }
}




    // Normal NLU path
    const { intent, entities } = detectIntent(message);
    await memoryService.recordUserMessage(userId, message, intent, entities);

    let reply;
    if (intent === "product_search") reply = await ecommerce.handle(message, userId);
    else if (intent === "schedule_meeting") reply = await productivity.handle(message, userId);
    else if (intent === "support_issue") reply = await support.handle(message, userId);
    else reply = { text: "I'm not sure I understood that. Can you clarify?" };

    await memoryService.recordBotMessage(userId, reply.text);
    return res.json(reply);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ text: "Internal server error" });
  }
};
