const express = require('express');
const { getRss } = require('./function');


const app = express();
app.use(require('compression')());

app.get('/atom.xml', async function (req, res) {
    res.contentType('application/xml');
    res.send(await getRss());
});


app.listen(3000, '127.0.0.1');