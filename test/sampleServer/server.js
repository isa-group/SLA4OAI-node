var express = require('express');
var app = express();

var port = 3000;
var pets = [
    {
        name: 'Buddy',
        tag: 'dog'
    },
    {
        name: 'Daisy',
        tag: 'cat'
    }
];

app.get('/pets', function (req, res) {
    res.status(200).json(pets);
});

app.listen(port, function () {
    console.log('Sample app listening on port 3000!');
});