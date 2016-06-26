var serverUrl = 'http://localhost:3000';

window.onload = function() {
  var sortedData = [];
  $.get(serverUrl + '/rank', function(data, status) {
    var i;
    for (var country in data)
      sortedData.push({country: country,
                       data: data[country]});
    sortedData.sort(function(a, b) {
      return a.data > b.data ? -1 : 1;
    });
    for (var ranking = 0; ranking < sortedData.length; ranking++) {
      $('#rankingTableContent').html($('#rankingTableContent').html() + 
        '<tr>' + '<td>' + sortedData[ranking].country + '</td>' +
                 '<td>' + sortedData[ranking].data.toFixed(2) + '</td>' +
                 '<td>' + (ranking + 1) + '</td>' +
        '</tr>');
      if (ranking + 1 == 10)
        break;
    }
  });

  $('#submit').click(function() {
    var searchTeam = $('#search').val();
    var backInfo = '';
    if (searchTeam == '') {
      backInfo = '请输入一个国家的名字...';
    } else {
      var ranking;
      for (ranking = 0; ranking < sortedData.length; ranking++)
        if (sortedData[ranking].country == searchTeam) {
          backInfo = '国家：' + searchTeam + '；得分：' + sortedData[ranking].data.toFixed(2) +
                     '；排名：' + (ranking + 1);
          break;
        }
      if (searchTeam == '中国')
        backInfo = '抱歉，中国并未上榜...';
      if (backInfo == '')
        backInfo = '请输入合法的，进入过近年世界杯的球队...';
    }
    $('.modal-body').html(backInfo);
  });
}
