module.exports.detectIntent = (text) => {
  text = text.toLowerCase();

  // add hoodies & tshirts
  if (/buy|order|price|cart|hoodie|hoodies|tshirt|tshirts/.test(text))
    return { intent: "product_search", confidence: 0.9 };

  if (/book|meeting|schedule|remind/.test(text))
    return { intent: "schedule_meeting", confidence: 0.9 };

  if (/remind me|reminder|remind/.test(text)) 
    return { intent: "schedule_meeting", confidence: 0.9, type: "reminder" };

  if (/issue|problem|not working|error|fix/.test(text))
    return { intent: "support_issue", confidence: 0.9 };

  return { intent: "unknown", confidence: 0.4 };
};
