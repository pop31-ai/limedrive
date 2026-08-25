window.ZONES.push({
  name: 'Башня-10',
  ang: Math.PI * 9 / 5,
  swarms: [
    SIM.mkSwarm(0, 14, 4.9, ['klever', 'grechiha']),
    SIM.mkSwarm(1, 16, 5.3, ['malina', 'raznotrav', 'malina']),
    SIM.mkSwarm(2, 11, 4.4, ['lipa', 'lipa']),
    SIM.mkSwarm(3, 15, 5.1, ['grechiha', 'lipa', 'raznotrav']),
    SIM.mkSwarm(4, 17, 5.4, ['klever', 'klever', 'lipa']),
    SIM.mkSwarm(5, 12, 4.6, ['raznotrav', 'raznotrav', 'malina']),
    SIM.mkSwarm(6, 18, 5.5, ['lipa', 'malina']),
    SIM.mkSwarm(7, 13, 4.7, ['grechiha', 'grechiha', 'klever']),
    SIM.mkSwarm(8, 16, 5.2, ['malina', 'lipa', 'grechiha']),
    SIM.mkSwarm(9, 14, 5.0, ['lipa', 'klever', 'raznotrav'])
  ]
});
