var express = require('express');
var app = express();
// 引入数据库
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var url = 'mongodb://localhost:27017/test';
MongoClient.connect(url, function(err, db) {
  if (err) {
    console.log("Connected correctly to server.");
    db.close();
  } else {
    // 主体

    // 获取选手排名
    app.get('/', function(req, res) {
      res.redirect('/rank');
    });
    app.get('/rank', function(req, res) {
      res.send('rank');
      // TODO 排序
    });

    // 用户来维护比赛ID
    // 添加比赛项
    app.post('/add', function(req, res) {
      /* body的格式形如：
       * {content: [
       *     {id:'0', winner:"abc", loser:"xyz"},
       *     {id:'1', winner:"abc", loser:"efg"},
       *     {id:'2', winner:"xyz", loser:"efg"}
       *   ]
       * }
       * 重复的ID后一个会覆盖前一个的内容
       */
      // TODO 支持添加一个或多个
    });
    // 删除比赛项
    app.post('/delete', function(req, res) {
      /* body的格式形如：
       * {content: [
       *     {id:'0'},
       *     {id:'1'},
       *     {id:'2'}
       *   ]
       * }
       * 不存在的ID将不作任何处理
       */
      // TODO 支持删除一个或多个
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
