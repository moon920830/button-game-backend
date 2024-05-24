const { Bot, session, InlineKeyboard } = require("grammy");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Item, Social } = require("./model.js");
const { addHours } = require("date-fns");

// Initialize express app
const app = express();
const port = process.env.PORT || 5000;

// const botToken = process.env.BOT_TOKEN || "6739546265:AAEjZa7_igskqY0uCBWRZ5843AHpkpnV4ZY";

const botToken =
  process.env.BOT_TOKEN || "6912028347:AAH8L9xv4fkzQEZIYkyuXaDRmnZqKmYkCpA";
const bot = new Bot(botToken);

const initial = () => {
  return {};
};

let inviteData = null;

bot.use(session({ initial }));

bot.command("start", async (ctx) => {
  const userid = ctx.from.username; // Get the Telegram user ID
  const receiveid = ctx.match;
  let user = await Item.findOne({ t_id: userid }).lean().exec();
  if((!user) && receiveid) {
      console.log("hello")
      user = new Item({t_id: userid, t_friend_id: receiveid, t_name: "hello", mount: 0});
      user.save()
      let sender =  await Item.findOne({t_id: receiveid});
      sender.mount += 5000;
      const newsender = await sender.save()
  }
  const menus = new InlineKeyboard()
    .webApp(
      "Play in 1 click",
      `https://button-game-frontend.vercel.app/?user=${encodeURIComponent(
        userid
      )}`
    )
    .row()
    .url("Subscribe to the channel", `https://t.me/MagicVipClub`)
    .row()
    .text("How to earn from the game", `howToEarn`)
    .row()
    .url("Mining NFTs", "https://getgems.io/virtualsworlds")
    .url("Swap VWS", "https://dedust.io/swap/TON/VWS")
    .row()
    .url("Mining Pool VWS", "https://dedust.io/pools/TON/VWS")
    .url(
      "Swap VWS Xrocket",
      "https://t.me/tonRocketBot/cex?startapp=trade-VWS-TON"
    )
    .row()
    .url(
      "Mining Pool MVP",
      "https://dedust.io/pools/EQD4DpRTiPUWwKn_n0YXETo7RWODYqwfe_aarA63s-A7atzj"
    )
    .url("Swap MVP", "https://dedust.io/swap/TON/MVP")
    .row();

  await ctx.reply(
    `Hello, @${userid}! Welcome to VWS Worlds.\nYou are now the director of a crypto exchange.\nWhich one? You choose. Tap the screen, collect coins, pump up your passive, develop your own income strategy.\nWe’ll definitely appreciate your efforts once the token is listed (the dates are coming soon).\nDon't forget about your friends — bring them to the game and get even more coins together!`,
    {
      reply_markup: menus,
      parse_mode: "HTML",
    }
  );
});

bot.on("callback_query:data", async (ctx) => {
  const data = ctx.callbackQuery.data;
  switch (data) {
    case "howToEarn":
      const menus = new InlineKeyboard().webApp(
        "Play in 1 click",
        `https://button-game-frontend.vercel.app/?user=${encodeURIComponent(
          userid
        )}`
      )
      .row()
      .url("Subscribe to the channel", `https://t.me/MagicVipClub`);
      await ctx.reply(
        "How to play VWS Worlds ⚡️\n\nFull version of the guide.\n\n💰 Tap to earn\nTap the screen and collect coins.\n\n⛏ Mine\nUpgrade cards that will give you passive income.\n\n⏰ Profit per hour\nThe exchange will work for you on its own, even when you are not in the game for 3 hours.\nThen you need to log in to the game again.\n\n📈 LVL\nThe more coins you have on your balance, the higher the level of your exchange is and the faster you can earn more coins.\n\n👥 Friends\nInvite your friends and you’ll get bonuses. Help a friend move to the next leagues and you'll get even more bonuses.\n\n/help to get this guide",
        {
          reply_markup: menus,
          parse_mode: "HTML",
        }
      );
    default:
      break;
  }
});

(async () => {
  // Delete webhook before starting the bot
  await bot.api.deleteWebhook();

  // Start bot with getUpdates (polling)
  bot.start();
})();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// MongoDB connection
const dbURI =
  "mongodb+srv://lucasdavis0830:atDHB1TMJRGKsUuW@cluster0.qyqtswq.mongodb.net/test";
// const dbURI = 'mongodb://127.0.0.1:27017/test'
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected");
    insertDefaultDocument();
  })
  .catch((err) => console.log(err));

// Define schema and model

// Function to insert default document
const insertDefaultDocument = async () => {
  try {
    const existingItem = await Item.findOne({ t_id: "telegram" });
    if (!existingItem) {
      const defaultItem = new Item({
        t_id: "telegram",
        t_name: "Team Mark(SEO)",
        mount: 0,
      });
      await defaultItem.save();
      console.log("Default document inserted");
    } else {
      console.log("Default document already exists");
    }
  } catch (err) {
    console.log("Error checking/inserting default document:", err);
  }
};

// Routes
app.get("/items", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/items/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (item == null) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/items", async (req, res) => {
  const { user } = req.body;
  console.log(user);
  let item = await Item.findOne({ t_id: user });

  if (!item) {
    item = new Item({ t_id: user, t_name: "hello", mount: 0 });
    item
      .save()
      .then(() => {
        return res.json({ stats: "success", item });
      })
      .catch(() => {
        return res.json({ stats: "error" });
      });
  } else return res.json({ stats: "success", item });
  // res.json(item);
});

app.post('/friends', async (req, res) => {
  const { user } = req.body;
  let items = await Item.find({ t_friend_id: user });
  if(items.length == 0) {
    return res.json({stats: "no friend found"})
  }
  else return res.json({stats: "success", items})
  // res.json(item);
});

app.post('/getItem', async (req, res) => {
  try {
    const { user } = req.body
    console.log(req.body)
    const item = await Item.findOne({t_id : user});
    item.mount += 1;
    item.save()
    res.json({stats: 'success'})
    
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete("/items/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (item == null) {
      return res.status(404).json({ message: "Item not found" });
    }

    await item.remove();
    res.json({ message: "Deleted Item" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/bonous", async (req, res) => {
  const { id, title } = req.body;
  const currentDateTime = new Date();

  const recentSocials = await Social.find({
    t_id: id,
    s_name: title,
    s_date: { $gte: addHours(currentDateTime, -24) }, // Check if the s_date is within the last 24 hours
  });

  if (recentSocials.length > 0) {
    return res.json({ stats: "error", message: "You need more time" });
  }
  const item = await Item.findById(id);
  item.mount = item.mount + 1000;
  const updatedItem = await item.save();
  social = new Social({ t_id: id, s_name: title, s_date: currentDateTime });
  social
    .save()
    .then(() => {
      return res.json({ stats: "success", mount: item.mount });
    })
    .catch(() => {
      return res.json({ stats: "social save error" });
    });
});

app.post("/sendInvite", async (req, res) => {
  const { inviteLink, user } = req.body;

  if (!inviteLink || !user) {
    return res.status(400).json({ error: "Missing invite link or user" });
  }

  try {
    inviteData = { user };
    return res.status(200).json({ stats: "ok" });
  } catch (error) {
    console.error("Error sending invite link:", error);
    res.status(500).json({ error: "Failed to send invite link" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
