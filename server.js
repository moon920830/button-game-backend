const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// Initialize express app
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
const dbURI = 'mongodb+srv://lucasdavis0830:atDHB1TMJRGKsUuW@cluster0.qyqtswq.mongodb.net/';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    insertDefaultDocument();
  })
  .catch(err => console.log(err));

// Define schema and model
const Schema = mongoose.Schema;
const itemSchema = new Schema({
  t_id: { type: String, required: true },
  t_name: { type: String, required: true },
  mount: { type: Number, required: true }
});
const Item = mongoose.model('Item', itemSchema);

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
  const item = new Item({
    t_id: req.body.t_id,
    t_name: req.body.t_name,
    mount: req.body.mount
  });
  try {
    const newItem = await item.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
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

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
