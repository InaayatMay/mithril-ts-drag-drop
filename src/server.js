const multiparty = require('multiparty-express')
const express = require('express')
const app = express()
const port = 3000
const path = require('path')

app.use(express.static('src'))
app.use(express.static('dist'))

app.get('/', (req, res) => res.sendFile("index.html"))

app.post('/uploadDocuments', multiparty.multipartyExpress(), (req, res, next) => {
    console.log(req.body);
    multiparty.cleanup(req);

    res.json({
        status:"success",
        numberOfuploadedFiles:2
    })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))