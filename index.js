const WebSocket = require('ws');

const ws = new WebSocket('ws://community.steam-api.com/websocket/');

ws.on('open', () => {
  const subscribe = {
    message: 'subscribe',
    seqnum: 1,
    feed: 'TeamEventScores'
  };
  ws.send(JSON.stringify(subscribe));
});

ws.on('message', message => {
  console.log(' ');

  let scores;
  let saleDay;
  let currentTime;

  const data = JSON.parse(message);
  if (data && data.message && data.message == 'feedupdate') {
    if (data.feed == 'TeamEventScores') {
      const feed = JSON.parse(data.data);
      if (!feed || !feed.scores) {
        return;
      }
      scores = feed.scores;
      saleDay = feed.sale_day;
      currentTime = convertUnixTimestamp(feed.current_time);
    }
  }

  let allScores = [];

  if (scores) {
    scores.map(score => {
      const id = score.teamid;
      const teamName =
        id === 1
          ? 'Hare'
          : id === 2
          ? 'Tortoise'
          : id === 3
          ? 'Corgi'
          : id === 4
          ? 'Cockatiel'
          : id === 5
          ? 'Pig'
          : 'Unknown';
      const teamId = score.teamid;
      const pct = Number((score.score_pct * 100).toFixed(2));
      const distance = Number(score.score_dist.toFixed(2));
      const totalBoosts = Number(score.total_boosts).toLocaleString('en');
      const totalDeboosts = Number(score.total_deboosts).toLocaleString('en');
      const multiplier = Number(
        Number(score.current_multiplier * 10000).toFixed(2)
      );
      const multiplierBoosts = Number(
        score.current_multiplier_boosts.toFixed(2)
      );
      const activeBoosts = Number(score.current_active_boosts).toLocaleString(
        'en'
      );
      const activeDeboosts = Number(
        score.current_active_deboosts
      ).toLocaleString('en');

      allScores = [
        ...allScores,
        {
          id: teamId,
          name: teamName,
          'win %': pct,
          'distance km': distance,
          'multiplier %': multiplier,
          'speed x': multiplierBoosts,
          'active boosts': activeBoosts,
          'active deboosts': activeDeboosts,
          'total boosts': totalBoosts,
          'total deboosts': totalDeboosts
        }
      ];
    });
  }

  if (allScores.length > 0) {
    const allScoresSorted = allScores
      .sort((a, b) => a['distance km'] - b['distance km'])
      .reverse();

    console.log(`👜 Day ${saleDay} - ${currentTime}`);
    console.table(allScoresSorted);
  }
});

const convertUnixTimestamp = t => {
  var dt = new Date(t * 1000);
  var hr = dt.getHours();
  var m = '0' + dt.getMinutes();
  var s = '0' + dt.getSeconds();
  return hr + ':' + m.substr(-2) + ':' + s.substr(-2);
};
