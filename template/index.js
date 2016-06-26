var express = require('express');
var app = express();
// 引入数据库
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
// 引入body-parser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
// 引入promise
var Promise = require('promise');

var matches = [];
var players = {};

var insertMatches = function(db, data, callback) {
  db.collection('matches').insertOne(data, function(err, result) {
    assert.equal(err, null);
    callback();
  });
};

var removeMatches = function(db, data, callback) {
   db.collection('matches').deleteMany(
      { "id": data },
      function(err, results) {
         callback();
      }
   );
};

var listMatches = function(db, callback) {
   var cursor = db.collection('matches').find( );
   cursor.each(function(err, doc) {
      assert.equal(err, null);
      if (doc != null) {
        if (players[doc.winner] == null)
          players[doc.winner] = 100;
        if (players[doc.loser] == null)
          players[doc.loser] = 100;
        if (matches[doc.winner]) {
          if (matches[doc.winner][doc.loser])
            matches[doc.winner][doc.loser]++;
          else
            matches[doc.winner][doc.loser] = 1;
        } else {
          matches[doc.winner] = [];
          matches[doc.winner][doc.loser] = 1;
        }
        for (player in players)
          for (player_ in players) {
            if (matches[player] == null)
              matches[player] = [];
            if (matches[player][player_] == null)
              matches[player][player_] = 0;
          }
      } else {
        callback();
      }
   });
};

var url = 'mongodb://localhost:27017/test';
MongoClient.connect(url, function(err, db) {
  if (err) {
    console.log("Connected correctly to server.");
    db.close();
  } else {
    // 主体

    // 获取选手排名
    app.get('/rank', function(req, res) {
      matches = [];
      players = {};
      listMatches(db, function() {
        var loopCount = 10;
        var buffer = [];
        while (loopCount--) {
          for (var player in players) {
            var bijSum = 0, bijPlusBjiSum = 0;
            for (var player_ in players) {
              if (player != player_) {
                bijSum += matches[player][player_];
                bijPlusBjiSum += (matches[player][player_] + matches[player_][player]) /
                                 (players[player] + players[player_]);
              }
            }
            buffer[player] = bijSum / bijPlusBjiSum;
          }
          for (player in players)
            players[player] = buffer[player];
        }
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.json(players);
      });
    });

    // 用户来维护比赛ID
    // 添加比赛项
    app.post('/add', function(req, res) {
      // body的格式形如：{ data: '0 abc xyz|1 abc efg|2 xyz abc' }
      // 重复的ID会引起错误的删除
      // 支持添加一个或多个
      data = req.body.data.split('|');
      for (var i = 0; i < data.length; i++) {
        info = data[i].split(' ');
        insertMatches(db, {
          id: info[0],
          winner: info[1],
          loser: info[2]
        }, function() {});
      }
    });
    // 删除比赛项
    app.post('/delete', function(req, res) {
      // body的格式形如：{ data: '0|1|2' }
      // 支持删除一个或多个
      data = req.body.data.split('|');
      for (var i = 0; i < data.length; i++)
        removeMatches(db, data[i], function() {});
    });

    // 404
    app.get('*', function(req, res) {
      res.send('404');
    });
    app.post('*', function(req, res) {
      res.send('404');
    });

    var server = app.listen(3000, function() {
      var host = server.address().address;
      var port = server.address().port;

      console.log('Example app listening at http://%s:%s', host, port);
    });
  }
});
