const { Bot, session, InlineKeyboard } = require("grammy");
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Item, Social } = require('./model.js');
const { addHours } = require('date-fns');

// Initialize express app
const app = express();
const port = process.env.PORT || 5000;

const botToken = process.env.BOT_TOKEN || "6739546265:AAEjZa7_igskqY0uCBWRZ5843AHpkpnV4ZY";
const bot = new Bot(botToken);

const initial = () => {
  return {};
};

let inviteData = null;

bot.use(session({ initial }));

bot.command("start", async (ctx) => {
  const userid = ctx.from.username; // Get the Telegram user ID
  const refMatch = ctx.message.text.match(/\/start\?ref=(\w+)/);
  const ref = refMatch ? refMatch[1] : null;
  
  console.log(ref); 
  const menus = new InlineKeyboard().webApp(
    "Start",
    "https://stackoverflow.com"
  ).row().webApp(
    "Click to play",
     `https://button-game-frontend.vercel.app/?user=${encodeURIComponent(userid)}`
    // `http://localhost:3000/?user=${encodeURIComponent(userid)}`
  ) 

  await ctx.reply(
    `<b>He, user! Welcome to VirtualsWorlds. Your Telegram ID is @${userid}.</b>\n\nVirtualsWorlds is a SocialFi + GameFi.\n\nYou are now the director of a crypto exchange.\nWhich one? You choose. Tap the screen, collect coins, pump up your passive income, develop your own income strategy.\nWe’ll definitely appreciate your efforts once the token is listed (the dates are coming soon).\nDon't forget about your friends — bring them to the game and get even more coins together!`,
    {
      reply_markup: menus,
      parse_mode: "HTML",
    }
  );
});

(async () => {
  // Delete webhook before starting the bot
  await bot.api.deleteWebhook();

  // Start bot with getUpdates (polling)
  bot.start();
})();



// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
const dbURI = 'mongodb+srv://lucasdavis0830:atDHB1TMJRGKsUuW@cluster0.qyqtswq.mongodb.net/test';
// const dbURI = 'mongodb://127.0.0.1:27017/test'
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    insertDefaultDocument();
  })
  .catch(err => console.log(err));

// Define schema and model

// Function to insert default document
const insertDefaultDocument = async () => {
  try {
    const existingItem = await Item.findOne({ t_id: 'telegram' });
    if (!existingItem) {
      const defaultItem = new Item({
        t_id: 'telegram',
        t_name: 'Team Mark(SEO)',
        mount: 0
      });
      await defaultItem.save();
      console.log('Default document inserted');
    } else {
      console.log('Default document already exists');
    }
  } catch (err) {
    console.log('Error checking/inserting default document:', err);
  }
};

// Routes
app.get('/items', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (item == null) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/items', async (req, res) => {
  const { user } = req.body;
  console.log(user)
  let item = await Item.findOne({ t_id: user });
  
  if (!item) {
    item = new Item({ t_id: user, t_name: 'hello', mount: 0 });
    item.save().then(() => {
      return res.json({stats: 'success', item})
    }).catch(() => {
      return res.json({stats : 'error'})
    })
  }
  else return res.json({stats: 'success', item})
  // res.json(item);
});

app.patch('/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (item == null) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (req.body.t_id != null) {
      item.t_id = req.body.t_id;
    }
    if (req.body.t_name != null) {
      item.t_name = req.body.t_name;
    }
    if (req.body.count != null) {
      item.mount = req.body.count;
    }

    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (item == null) {
      return res.status(404).json({ message: 'Item not found' });
    }

    await item.remove();
    res.json({ message: 'Deleted Item' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/bonous', async (req, res) => {

    const { id, title } = req.body;
    const currentDateTime = new Date();

    const recentSocials = await Social.find({
      t_id: id,
      s_name: title,
      s_date: { $gte: addHours(currentDateTime, -24) } // Check if the s_date is within the last 24 hours
    });

    if (recentSocials.length > 0) {
      return res.json({ stats: 'error', message: 'You need more time' });
    }
    const item = await Item.findById(id);
    item.mount = item.mount + 1000;
    const updatedItem = await item.save();
    social = new Social({ t_id: id, s_name: title, s_date: currentDateTime });
    social.save().then(() => {
      return res.json({stats: 'success', mount: item.mount})
    }).catch(() => {
      return res.json({stats : 'social save error'})
    })
});

app.post('/sendInvite', async (req, res) => {
  const { inviteLink, user } = req.body;

  if (!inviteLink || !user) {
      return res.status(400).json({ error: 'Missing invite link or user' });
  }

  try {
    inviteData = { user };
    return res.status(200).json({stats: "ok"})
  } catch (error) {
      console.error('Error sending invite link:', error);
      res.status(500).json({ error: 'Failed to send invite link' });
  }
});

bot.on('message:text', async (ctx) => {
  // If invite data exists and the message sender is the same user who initiated the invite request
  if (inviteData && ctx.message.from.id === inviteData.user) {
      // Forward the message to the selected recipient
      await bot.api.forwardMessage(inviteData.user, ctx.message.chat.id, ctx.message.message_id);
      
      // Reset invite data
      inviteData = null;
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
