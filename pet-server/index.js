const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const corsOptions = {
    origin:['http://localhost:5173', 'http://localhost:5174', 'bjet-11-fc192.web.app'],
    credentials: true,
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions));
app.use(express.json());


app.get('/', (req, res) => {
    res.send('Ok? server')
})
app.listen(port, ()=>{
    console.log('server is running')
})
