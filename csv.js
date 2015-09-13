"use strict";
var csv = require('fast-csv');
var mongojs = require("mongojs");
var _ = require('underscore');
var async = require('async');
var geolib = require('geolib');
var express = require('express');

var databaseURI = process.env.MONGODB_URL || "127.0.0.1:27017/rotasegura";

var collections = ["ocorrencia"];

console.log("connecting to: ",databaseURI, collections);

var db = mongojs(databaseURI, collections);

db.on('error',function(err) {
    console.error('database error: ', databaseURI, err);
});

db.on('ready',function() {
    console.log('database connected: '+databaseURI);
});

module.exports = db;

var app = express();
var map_Ocorrencias = [];


var processStops2 = function(key, doc, cbk_db) {
    db.ocorrencia.update({data1: doc.data1},{$set: doc}, {upsert: true}, cbk_db);
};

var processAsyncDBcall = function(name, values, db_funcao_stops, callback) {

    var nOk = 0, nErr = 0;
    var start = Date.now();
    var keys =  Object.keys(values);
    console.log("GTFS: "+name+" - processing "+ keys.length+" items");
    async.eachLimit(keys, 3, function(key, cbk_each) {
        var doc = values[key]
        db_funcao_stops(key, doc, function(err,res) {
            if (err) {
                console.log("Error storing " + name+": "+err);
                nErr++;
                cbk_each();
                return;
            }
            if(res) nOk++; else nErr++;
            cbk_each();
        });
    }, function(err) {
        if (err) {
            console.log("Error executing: ",name," err:",err);
        }
        callback(err);
    });

};

var readOcorrencias = function (callback) {

    var readHeader = false;

    csv.fromPath("entrada.csv", {ignoreEmpty:true,headers:false})
        .on("data", function(data){
            if(!readHeader) { readHeader = true;  return; }

            var data1 = data[0];
            var doc = {
                data1: data1,
                loc: [parseFloat(data[1]), lng: parseFloat(data[2])],
                regiao: data[3],
                nome: data[4]
            };
            map_Ocorrencias.push(doc);
        })
        .on("end", function() {
            processAsyncDBcall("ocorrencia", map_Ocorrencias, processStops2, function(err) {console.log("processAsyncDBcall finished");callback(err);});
        });
};

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});

app.get('/ocorrencias', function (req, res){
    readOcorrencias(function(err) {
        if(err) console.log("Errou!");
        console.log("Acabou!");
        res.send(map_Ocorrencias);
    });
});

