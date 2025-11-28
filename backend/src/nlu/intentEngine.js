module.exports.detectIntent = (text) => {
  text = text.toLowerCase();

  // SUPPORT FIRST
  if (text.includes("issue") || 
      text.includes("problem") || 
      text.includes("help") || 
      text.includes("support")
    ) 
  {
    return { intent: "support_issue", entities: {} };
  }
  // add hoodies & tshirts
  if (/buy|order|price|cart|hoodie|hoodies|tshirt|tshirts/.test(text))
    return { intent: "product_search", confidence: 0.9 };

  if (/book|meeting|schedule|remind/.test(text))
    return { intent: "schedule_meeting", confidence: 0.9 };

  if (/remind me|reminder|remind/.test(text)) 
    return { intent: "schedule_meeting", confidence: 0.9, type: "reminder" };

  return { intent: "unknown", confidence: 0.4 };
};
