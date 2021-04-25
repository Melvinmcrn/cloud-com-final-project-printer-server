require('dotenv').config();
import express from 'express';
import cors from 'cors';
import {getPrintQueue, postPrint} from './controller';

const app = express();
const PORT = 5000;

app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/print', (req, res) => {
  getPrintQueue(res);
});

app.post('/post-print', (req, res) => {
  postPrint(req, res);
});

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
