const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Item, Social } = require('./model.js');
const { addHours } = require('date-fns');

// Initialize express app
const app = express();
const port = process.env.PORT || 5000;

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
      return res.json({stats: 'success'})
    }).catch(() => {
      return res.json({stats : 'social save error'})
    })
})

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
