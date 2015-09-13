var mongojs = require('mongojs');
var db = mongojs('rotasegura', ['ocorrencias']);

var csv = require('fast-csv');

var load = function (path) {
  csv.fromPath(path).on('data', function (data) {
    db.ocorrencias.insert({
      loc: [parseFloat(data[0]), parseFloat(data[1])],
      hora: new Date(data[2]),
      tipo: data[3],
      info: data[4],
      auto: true
    });
  });
}

load('csv/ocorrencias.csv');
load('csv/zonas.csv');
