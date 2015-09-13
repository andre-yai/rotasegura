var cors = require('cors');
var express = require('express');
var app = express();
app.use(cors());

var mongojs = require('mongojs');
var db = mongojs('rotasegura', ['ocorrencias']);

app.get('/ocorrencias', function (req, res) {
  db.ocorrencias.find(function (err, ocorrencias) {
    res.send(ocorrencias);
  });
});

app.get('/perigo', function (req, res) {
  lat = parseFloat(req.query.lat);
  lon = parseFloat(req.query.lon);

  db.ocorrencias.find({
    loc: {
      $geoWithin: { $centerSphere: [ [lat, lon], 0.2 / 6378.1 ] }
    }
  }, function (err, ocorrencias) {
    if (err) res.sendStatus(500);
    score = 0;
    console.log(ocorrencias.length);
    for (i = 0; i < ocorrencias.length; i++) {
      distance = getDistanceFromLatLonInKm(lat, lon, ocorrencias[i].loc[0], ocorrencias[i].loc[1]);
      score += 1 / (0.1 + distance);
    }
    res.send(score.toString());
  });
});

/* Iniciar servidor */
var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

/* Helpers */
function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}
