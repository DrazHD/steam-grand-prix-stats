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
      const distance = Number(score.score_dist.toFixed(0));
      const totalBoosts = Number(score.boosts);
      const totalDeboosts = Number(score.deboosts);
      const multiplier = Number((score.current_multiplier * 100).toFixed(3));
      const multiplierBoosts = Number(
        score.current_multiplier_boosts.toFixed(0)
      );
      const activeBoosts = score.current_active_boosts;
      const activeDeboosts = score.current_active_deboosts;

      allScores = [
        ...allScores,
        {
          teamId,
          teamName,
          distance,
          multiplier,
          multiplierBoosts,
          activeBoosts,
          activeDeboosts
        }
      ];
    });
  }

  if (allScores.length > 0) {
    const allScoresSorted = allScores
      .sort((a, b) => a.distance - b.distance)
      .reverse();

    console.log(`Day ${saleDay} - ${currentTime}`);
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
