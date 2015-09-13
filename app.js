var express = require('express');
var app = express();

var mongojs = require('mongojs');
var db = mongojs('rotasegura', ['ocorrencias']);

app.get('/ocorrencias', function (req, res) {
  db.ocorrencias.find(function(err, ocorrencias) {
    res.send(ocorrencias);
  });
});

/* Iniciar servidor */
var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

