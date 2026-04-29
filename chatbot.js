const express = require('express');
const Village = require('../models/Village');
const Product = require('../models/Product');
const Booking = require('../models/Booking');
const { auth } = require('../middleware/auth');

const router = express.Router();

// ─── Pull ALL live data from DB ───────────────────────────────────────────────
async function fetchAppData() {
  const [villages, products] = await Promise.all([
    Village.find({ status: 'verified', isActive: true })
      .populate('host', 'name phone')
      .select('name description state district stayOptions activities festivals localFood languages averageRating totalReviews safetyInfo nearestHospital nearestPoliceStation'),
    Product.find({ isAvailable: true })
      .populate('village', 'name state')
      .select('name description category price stock isService serviceType serviceDuration seller village')
  ]);
  return { villages, products };
}

// ─── Build a detailed text context from real DB data ─────────────────────────
function buildContext({ villages, products }) {
  const villageText = villages.map(v => {
    const stays = v.stayOptions?.map(s =>
      `    • ${s.title}: ₹${s.pricePerNight}/night (max ${s.maxGuests} guests)${s.amenities?.length ? ' — ' + s.amenities.join(', ') : ''}`
    ).join('\n') || '    • Contact host for pricing';

    const activities = v.activities?.map(a =>
      `    • ${a.name}${a.price > 0 ? ` (₹${a.price})` : ' (free)'}${a.description ? ': ' + a.description : ''}`
    ).join('\n') || '    • Ask host for activities';

    const festivals = v.festivals?.map(f =>
      `    • ${f.name} — ${f.month}`
    ).join('\n') || '';

    return `
VILLAGE: ${v.name}
  Location: ${v.district}, ${v.state}
  Rating: ${v.averageRating?.toFixed(1) || 'New'}/5 (${v.totalReviews || 0} reviews)
  Description: ${v.description}
  Host: ${v.host?.name || 'Available'}
  Languages: ${v.languages?.join(', ') || 'Hindi, English'}
  Local Food: ${v.localFood?.join(', ') || 'Traditional cuisine'}
  Stay Options:
${stays}
  Activities:
${activities}
${festivals ? `  Festivals:\n${festivals}` : ''}
  Safety: ${v.safetyInfo || 'Safe for travelers'}
  Nearest Hospital: ${v.nearestHospital || 'Ask host'}
  Nearest Police: ${v.nearestPoliceStation || 'Ask host'}`;
  }).join('\n\n---\n');

  const productText = products.length > 0
    ? '\n\nMARKETPLACE ITEMS:\n' + products.map(p =>
        `  • ${p.name} — ₹${p.price} [${p.isService ? 'Service: ' + (p.serviceType || '') : 'Product: ' + p.category}]${p.village ? ' from ' + p.village.name + ', ' + p.village.state : ''}`
      ).join('\n')
    : '';

  return villageText + productText;
}

// ─── Smart rule-based engine using real data ──────────────────────────────────
function smartReply(message, villages, products) {
  const msg = message.toLowerCase();

  // ── Greetings
  if (/^(hi|hello|hey|namaste|hii|helo|good\s*(morning|evening|afternoon))/.test(msg)) {
    const count = villages.length;
    const states = [...new Set(villages.map(v => v.state))].slice(0, 5).join(', ');
    return `Namaste! 🙏 Welcome to Village State!\n\nWe currently have **${count} verified villages** across ${states} and more.\n\nI can help you:\n🗺️ Find villages by state or activity\n💰 Compare prices and stay options\n🎉 Discover festivals and local food\n🛡️ Get safety info for solo travel\n🛒 Browse marketplace products\n\nWhat kind of experience are you looking for?`;
  }

  // ── List all villages
  if (/show|list|all village|available village|what village/.test(msg)) {
    if (villages.length === 0) return "No verified villages are available right now. Check back soon! 🌾";
    const list = villages.map(v => {
      const minPrice = v.stayOptions?.length > 0 ? Math.min(...v.stayOptions.map(s => s.pricePerNight)) : null;
      return `🏡 **${v.name}** — ${v.district}, ${v.state} | ⭐${v.averageRating?.toFixed(1) || 'New'} | ${minPrice ? `from ₹${minPrice}/night` : 'Contact host'}`;
    }).join('\n');
    return `Here are all our available villages:\n\n${list}\n\nAsk me about any specific village for more details!`;
  }

  // ── State-based search
  const stateMatch = villages.filter(v =>
    msg.includes(v.state.toLowerCase()) ||
    msg.includes(v.district.toLowerCase())
  );
  if (stateMatch.length > 0 && /village|stay|visit|go|travel|trip|book/.test(msg)) {
    const details = stateMatch.map(v => {
      const minPrice = v.stayOptions?.length > 0 ? Math.min(...v.stayOptions.map(s => s.pricePerNight)) : null;
      const acts = v.activities?.slice(0, 3).map(a => a.name).join(', ');
      return `🏡 **${v.name}** (${v.district}, ${v.state})\n   ⭐ ${v.averageRating?.toFixed(1) || 'New'}/5 · ${minPrice ? `From ₹${minPrice}/night` : 'Contact host'}\n   📍 Activities: ${acts || 'Ask host'}\n   🍛 Food: ${v.localFood?.slice(0, 3).join(', ') || 'Traditional'}`;
    }).join('\n\n');
    return `Found ${stateMatch.length} village(s) matching your search:\n\n${details}\n\nWant to know more about any of these?`;
  }

  // ── Village name match (specific village info)
  const villageMatch = villages.find(v =>
    msg.includes(v.name.toLowerCase()) ||
    msg.includes(v.district.toLowerCase())
  );
  if (villageMatch) {
    const v = villageMatch;
    const stays = v.stayOptions?.map(s => `  • ${s.title}: ₹${s.pricePerNight}/night (max ${s.maxGuests} guests)`).join('\n') || '  • Contact host';
    const acts = v.activities?.map(a => `  • ${a.name}${a.price > 0 ? ` — ₹${a.price}` : ' (free)'}`).join('\n') || '  • Ask host';
    const fests = v.festivals?.map(f => `  • ${f.name} (${f.month})`).join('\n');
    return `🏡 **${v.name}**, ${v.district}, ${v.state}\n\n⭐ Rating: ${v.averageRating?.toFixed(1) || 'New'}/5 (${v.totalReviews || 0} reviews)\n\n📖 ${v.description}\n\n🛏️ Stay Options:\n${stays}\n\n🎯 Activities:\n${acts}\n${fests ? `\n🎉 Festivals:\n${fests}\n` : ''}\n🍛 Local Food: ${v.localFood?.join(', ') || 'Ask host'}\n🗣️ Languages: ${v.languages?.join(', ') || 'Hindi, English'}\n\n🛡️ Safety: ${v.safetyInfo || 'Safe for travelers'}\n🏥 Hospital: ${v.nearestHospital || 'Ask host'}\n\nGo to the Explore page to book this village!`;
  }

  // ── Budget / price queries
  if (/cheap|budget|affordable|low.?cost|price|cost|expensive|₹|rs\.?|rupee/.test(msg)) {
    const withPrices = villages.filter(v => v.stayOptions?.length > 0);
    if (withPrices.length === 0) return "Please check our Explore page for current pricing!";
    const sorted = [...withPrices].sort((a, b) => {
      const aMin = Math.min(...a.stayOptions.map(s => s.pricePerNight));
      const bMin = Math.min(...b.stayOptions.map(s => s.pricePerNight));
      return aMin - bMin;
    });
    const list = sorted.slice(0, 5).map(v => {
      const min = Math.min(...v.stayOptions.map(s => s.pricePerNight));
      const max = Math.max(...v.stayOptions.map(s => s.pricePerNight));
      return `  💰 **${v.name}** (${v.state}) — ₹${min}${max !== min ? `–₹${max}` : ''}/night`;
    }).join('\n');
    return `Here are our most affordable villages:\n\n${list}\n\nAll prices are per night and include host hospitality. Want details on any specific village?`;
  }

  // ── Activity-based queries
  const activityKeywords = ['trek', 'boat', 'safari', 'cook', 'craft', 'farm', 'fishing', 'hike', 'music', 'dance', 'yoga', 'camp', 'tour', 'ride', 'swim', 'nature'];
  const matchedActivity = activityKeywords.find(k => msg.includes(k));
  if (matchedActivity || /activ|thing to do|what to do|experience/.test(msg)) {
    const keyword = matchedActivity || '';
    const matching = villages.filter(v =>
      v.activities?.some(a =>
        a.name.toLowerCase().includes(keyword) || a.description?.toLowerCase().includes(keyword)
      )
    );
    const source = matching.length > 0 ? matching : villages;
    const results = source.slice(0, 4).map(v => {
      const relevant = keyword
        ? v.activities?.filter(a => a.name.toLowerCase().includes(keyword) || a.description?.toLowerCase().includes(keyword))
        : v.activities?.slice(0, 2);
      const actList = relevant?.map(a => `${a.name}${a.price > 0 ? ` (₹${a.price})` : ''}`).join(', ') || 'Various activities';
      return `  🎯 **${v.name}** (${v.state}) — ${actList}`;
    }).join('\n');
    return `${keyword ? `Villages with ${keyword} activities` : 'Villages with activities'}:\n\n${results}\n\nVisit the Explore page to see full activity details and book!`;
  }

  // ── Festival queries
  if (/festival|celebrat|event|tradition|culture/.test(msg)) {
    const withFests = villages.filter(v => v.festivals?.length > 0);
    if (withFests.length === 0) return "Check individual village pages for festival details — many host family events and local celebrations!";
    const list = withFests.map(v =>
      `  🎉 **${v.name}** (${v.state}): ${v.festivals.map(f => `${f.name} (${f.month})`).join(', ')}`
    ).join('\n');
    return `Villages with upcoming festivals:\n\n${list}\n\nFestivals are a magical time to visit! Book early as spots fill up fast.`;
  }

  // ── Food queries
  if (/food|eat|cuisine|meal|cook|dish|restaurant|taste/.test(msg)) {
    const withFood = villages.filter(v => v.localFood?.length > 0);
    const list = withFood.slice(0, 5).map(v =>
      `  🍛 **${v.name}** (${v.state}): ${v.localFood.join(', ')}`
    ).join('\n');
    return `Local food at our villages:\n\n${list}\n\nAll our host families cook fresh traditional meals for guests. Most stays include home-cooked breakfast and dinner!`;
  }

  // ── Safety / solo travel
  if (/safe|solo|alone|woman|women|girl|security|danger|emergency/.test(msg)) {
    const safeVillages = villages.filter(v => v.safetyInfo);
    const list = safeVillages.slice(0, 3).map(v =>
      `  🛡️ **${v.name}**: ${v.safetyInfo}`
    ).join('\n');
    return `Safety is our priority! Here's what our hosts say:\n\n${list || '  🛡️ All our villages have verified Aadhaar-checked hosts'}\n\n📞 Emergency numbers:\n  • Police: 100\n  • Ambulance: 108\n  • Women's helpline: 1091\n\n✅ All Village State hosts are identity-verified. Use our Safe Route Finder for travel directions!`;
  }

  // ── Marketplace / products
  if (/marketplace|product|buy|shop|craft|handmade|souvenir|gift|artisan|organic/.test(msg)) {
    if (products.length === 0) return "Our marketplace is growing! Visit the Marketplace tab — village artisans will soon list handmade products and local services.";
    const byCategory = {};
    products.forEach(p => {
      const cat = p.isService ? 'Services' : (p.category || 'Other');
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(p);
    });
    const list = Object.entries(byCategory).map(([cat, items]) =>
      `  🛒 **${cat}**: ${items.slice(0, 3).map(i => `${i.name} (₹${i.price})`).join(', ')}`
    ).join('\n');
    return `Our marketplace has ${products.length} items:\n\n${list}\n\nVisit the Marketplace tab to browse and contact sellers directly!`;
  }

  // ── Booking help
  if (/book|reserv|how to|steps|process/.test(msg)) {
    const example = villages[0];
    return `Booking is simple! Here's how:\n\n1️⃣ Go to **Explore Villages**\n2️⃣ Browse and pick a village${example ? ` (e.g. ${example.name})` : ''}\n3️⃣ Click the village to see stay options\n4️⃣ Choose your dates and number of guests\n5️⃣ Pay securely via Stripe\n6️⃣ Your host confirms within 24 hours!\n\n💳 We accept all major debit/credit cards.\n🔒 Payments are secured by Stripe.\n\nNeed help picking a village? Tell me your state, budget or interests!`;
  }

  // ── Ratings / best villages
  if (/best|top|highest|rated|recommend|popular|suggest/.test(msg)) {
    const sorted = [...villages].sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    const list = sorted.slice(0, 4).map((v, i) => {
      const min = v.stayOptions?.length > 0 ? Math.min(...v.stayOptions.map(s => s.pricePerNight)) : null;
      return `  ${i + 1}. 🏡 **${v.name}** (${v.state}) — ⭐${v.averageRating?.toFixed(1) || 'New'} · ${min ? `₹${min}/night` : 'Contact host'}`;
    }).join('\n');
    return `Our top-rated villages:\n\n${list}\n\nAll verified and reviewed by real travelers. Want details on any of these?`;
  }

  // ── Host registration
  if (/host|register|list my|earn|income|join as/.test(msg)) {
    return `Want to become a host? 🏠\n\nHere's how:\n1. Click **Register** and select "I'm a Host"\n2. Add your village details, photos, stay options and activities\n3. Submit for admin review (24-48 hours)\n4. Once approved, travelers can discover and book your village!\n\n💰 You earn **90% of every booking**. Platform fee is just 10%.\n📈 Our hosts earn ₹15,000–₹50,000/month on average.\n\nRegister now from the top right corner!`;
  }

  // ── Cancel / refund
  if (/cancel|refund|policy/.test(msg)) {
    return `Cancellation policy:\n\n✅ 7+ days before check-in → Full refund\n⚠️ 3–7 days before → 50% refund\n❌ Under 3 days → No refund\n\nTo cancel, go to **My Trips** in your profile and click Cancel on the booking.`;
  }

  // ── Payment questions
  if (/pay|payment|stripe|card|upi|method/.test(msg)) {
    return `Payment options:\n\n💳 Credit/Debit cards (Visa, Mastercard, Rupay)\n🔒 Secured by Stripe\n📱 UPI — coming soon!\n\nPayment is collected upfront and released to the host after your check-in. Your money is safe!`;
  }

  // ── Default with real village count
  const count = villages.length;
  const states = [...new Set(villages.map(v => v.state))];
  return `I'm your Village State assistant! 🏡\n\nWe have **${count} verified villages** across ${states.length} states: ${states.join(', ')}.\n\nI can help you with:\n🗺️ **Find villages** — by state, activity, or budget\n⭐ **Best rated** — top reviewed villages\n💰 **Budget options** — cheapest stays\n🎉 **Festivals** — upcoming cultural events\n🍛 **Local food** — authentic cuisine info\n🛡️ **Safety** — solo traveler tips\n🛒 **Marketplace** — handmade products\n📅 **Booking** — how to book a stay\n\nJust ask me anything!`;
}

// ─── FREE AI via Hugging Face (optional upgrade) ──────────────────────────────
async function tryHuggingFace(message, context, history, hfKey) {
  const historyText = history.slice(-6).map(m =>
    m.role === 'user' ? `[INST] ${m.content} [/INST]` : m.content
  ).join('\n');

  const prompt = `<s>[INST] You are a knowledgeable travel assistant for Village State, an Indian rural tourism platform. Use the following REAL data from the platform to answer accurately. Be warm, helpful and specific — mention actual village names, prices, and activities from the data.

PLATFORM DATA:
${context}

Rules:
- Only suggest villages/products that exist in the data above
- Mention actual prices and ratings
- Be specific and helpful
- Keep response under 200 words
[/INST]
${historyText}
[INST] ${message} [/INST]`;

  const response = await fetch(
    'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${hfKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 300, temperature: 0.6, return_full_text: false }
      })
    }
  );

  if (!response.ok) return null;
  const data = await response.json();
  return Array.isArray(data) && data[0]?.generated_text
    ? data[0].generated_text.trim()
    : null;
}

// ─── Main route ───────────────────────────────────────────────────────────────
router.post('/message', auth, async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    if (!message?.trim()) return res.status(400).json({ success: false, message: 'Message required' });

    // Fetch live data
    const { villages, products } = await fetchAppData();

    // Try HF AI if key is set
    const hfKey = process.env.HUGGINGFACE_API_KEY;
    if (hfKey && hfKey !== 'your_huggingface_api_key') {
      try {
        const context = buildContext({ villages, products });
        const aiReply = await tryHuggingFace(message, context, conversationHistory, hfKey);
        if (aiReply) return res.json({ success: true, reply: aiReply, mode: 'ai' });
      } catch { /* fall through to rule-based */ }
    }

    // Rule-based using real DB data
    const reply = smartReply(message, villages, products);
    res.json({ success: true, reply, mode: 'smart-rule-based' });

  } catch (err) {
    console.error('Chatbot error:', err);
    res.json({
      success: true,
      reply: 'Sorry, I had trouble fetching data. Please try again or visit the Explore page!',
      mode: 'error'
    });
  }
});

// ─── Quick suggestions endpoint (for chatbot quick replies) ───────────────────
router.get('/suggestions', auth, async (req, res) => {
  try {
    const { villages } = await fetchAppData();
    const states = [...new Set(villages.map(v => v.state))].slice(0, 4);
    const suggestions = [
      'Show all villages',
      'What are the best rated villages?',
      'Cheapest stays available',
      ...states.map(s => `Villages in ${s}`),
      'Solo travel safety tips',
      'How do I book a stay?',
      'Show marketplace products',
    ].slice(0, 8);
    res.json({ success: true, suggestions });
  } catch {
    res.json({ success: true, suggestions: ['Show all villages', 'Best rated villages', 'How to book?'] });
  }
});

module.exports = router;
