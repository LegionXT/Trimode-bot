const Meeting = require("../models/Meeting");
const Reminder = require("../models/Reminder");
const memoryService = require("../services/memoryService");

/**
 * Entry point when detectIntent => schedule_meeting
 * This asks first question and sets state to await date.
 */
exports.handle = async (message, userId) => {
  // try to extract a short title or participant from message
  // naive extraction: look for "with <name>" or "meeting" phrase
  const lower = message.toLowerCase();
  let participant = null;
  const withMatch = lower.match(/with\s+([a-zA-Z]+)/);
  if (withMatch) participant = withMatch[1];

  // save a tentative title and participant
  await memoryService.recordUserMessage(userId, message, "schedule_meeting", { participant });
  await memoryService.setState(userId, "awaiting_meeting_date", { field: "meeting_date", temp: { participant } });

  const ask = participant
   ? `When should I schedule the meeting with ${participant}? (date e.g. 2025-12-03 or "tomorrow")`
   : `Sure — which day should I schedule the meeting? (reply with date like 2025-12-03 or "tomorrow")`;


  return { text: ask };
};

/**
 * Handle date input (strings like "2025-12-03", "tomorrow", "next monday")
 * This is minimal parsing: if ISO date provided we use it, otherwise store raw string.
 */
exports.handleDate = async (userId, dateText) => {
  // naive normalization: try to parse ISO date
  const normalized = dateText.trim();
  // store the date and ask time
  const mem = await memoryService.getMemory(userId);
  const temp = mem.awaiting?.temp || {};
  temp.date = normalized;
  await memoryService.setState(userId, "awaiting_meeting_time", { field: "meeting_time", temp });

  return { text: `Got it. What time should I schedule it? (e.g. 15:00 or 3pm)` };

};


/**
 * Handle time input; then ask duration and confirm
 */
exports.handleTime = async (userId, timeText) => {
  // --- Detect phrases like "for 2 hours" ---
  const low = timeText.toLowerCase();
  const hourMatch = low.match(/(\d+)\s*hour/);

  if (hourMatch) {
    const hours = parseInt(hourMatch[1], 10);
    const minutes = hours * 60;

    const mem = await memoryService.getMemory(userId);
    const temp = mem.awaiting?.temp || {};

    const meeting = new Meeting({
      userId,
      title: temp.participant ? `Meeting with ${temp.participant}` : "Meeting",
      participants: temp.participant ? [temp.participant] : [],
      date: temp.date || "",
      time: temp.time || "N/A",
      durationMinutes: minutes
    });

    await meeting.save();
    await memoryService.clearState(userId);

    return { text: `Meeting scheduled for ${minutes} minutes ✔️` };
  }

  // --- Normal time → ask for duration ---
  const mem = await memoryService.getMemory(userId);
  const temp = mem.awaiting?.temp || {};
  temp.time = timeText.trim();

  await memoryService.setState(userId, "awaiting_meeting_duration", { field: "meeting_duration", temp });

  return { text: `What duration? (minutes) e.g. 30 or 60` };
};



/**
 * Handle duration, create meeting, clear state
 */
exports.handleDuration = async (userId, durationText) => {
  const mem = await memoryService.getMemory(userId);
  const temp = mem.awaiting?.temp || {};

  const low = durationText.toLowerCase().trim();
  let minutes = 60; // default

  // --- Pattern 1: "90" / "45" / "30" ---
  const onlyNumber = low.match(/^(\d+)$/);
  if (onlyNumber) {
    minutes = parseInt(onlyNumber[1], 10);
  }

  // --- Pattern 2: "30 min" / "30 mins" / "45 minutes" ---
  const minMatch = low.match(/(\d+)\s*(min|mins|minute|minutes)/);
  if (minMatch) {
    minutes = parseInt(minMatch[1], 10);
  }

  // --- Pattern 3: "1 hour" / "2 hours" / "1 hr" ---
  const hourMatch = low.match(/(\d+)\s*(hour|hours|hr|hrs)/);
  if (hourMatch) {
    minutes = parseInt(hourMatch[1], 10) * 60;
  }

  // --- Pattern 4: "an hour" / "a hour" ---
  if (low.includes("an hour") || low.includes("a hour")) {
    minutes = 60;
  }

  // --- Create the meeting ---
  const meeting = new Meeting({
    userId,
    title: temp.title || (temp.participant ? `Meeting with ${temp.participant}` : "Meeting"),
    participants: temp.participant ? [temp.participant] : [],
    date: temp.date || "",
    time: temp.time || "",
    durationMinutes: minutes
  });

  await meeting.save();
  await memoryService.clearState(userId);

  return {
    text: `Meeting scheduled: ${meeting.title} on ${meeting.date} at ${meeting.time} for ${minutes} minutes.`
  };
};




/**
 * Reminder flow (optional): ask for when and create reminder
 */
exports.handleReminderStart = async (message, userId) => {
  // store reminder text and ask for when
  await memoryService.recordUserMessage(userId, message, "create_reminder", { text: message });
  await memoryService.setState(userId, "awaiting_reminder_time", { field: "reminder_time", temp: { text: message } });

  return { text: `When should I remind you? (e.g. 2025-12-03 18:00 or "tomorrow 6pm")` };
};

exports.handleReminderTime = async (userId, timeText) => {
  const mem = await memoryService.getMemory(userId);
  const temp = mem.awaiting?.temp || {};
  // try parse to Date, naive:
  const dt = new Date(timeText);
  const remindAt = isNaN(dt.getTime()) ? new Date() : dt;

  const reminder = new Reminder({
    userId,
    text: temp.text || "Reminder",
    remindAt
  });
  await reminder.save();

  await memoryService.clearState(userId);
  await memoryService.recordBotMessage(userId, `Reminder set for ${remindAt.toString()}`);

  return { text: `Okay — reminder set for ${remindAt.toString()}` };
};
