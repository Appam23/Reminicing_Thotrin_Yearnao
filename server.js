const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Upload endpoint
app.post('/upload', upload.single('image'), (req, res) => {
  res.json({ filename: req.file.filename, url: `/uploads/${req.file.filename}` });
});

// List images endpoint
app.get('/images', (req, res) => {
  fs.readdir('uploads', (err, files) => {
    if (err) return res.status(500).json({ error: 'Failed to list images' });
    res.json(files.map(f => ({ filename: f, url: `/uploads/${f}` })));
  });
});

// Delete image endpoint
app.delete('/images/:filename', (req, res) => {
  const filePath = path.join('uploads', req.params.filename);
  fs.unlink(filePath, err => {
    if (err) return res.status(500).json({ error: 'Failed to delete image' });
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});