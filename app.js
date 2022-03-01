const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { readdirSync } = require('fs');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

readdirSync('./routes').map((route) =>
  app.use('/api', require(`./routes/${route}`))
);

// app.get('/', (req, res) => {
//   fs.readFile('docs/apiDocs.json', (err, data) => {
//     if (err) {
//       return res.status(400).json({
//         error: err,
//       });
//     }
//     const docs = JSON.parse(data);
//     res.json(docs);
//   });
// });

app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MONGODB Connected'))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
