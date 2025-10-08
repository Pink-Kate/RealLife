const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Статичні файли з папки dist
app.use(express.static('dist'));

// Всі маршрути ведуть до index.html (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Life Progress App running on port ${port}`);
});
