var dotenv = require('dotenv');
var http = require('http');
var cluster = require('cluster');
var port = 3000;

dotenv.load();

if (cluster.isMaster) {
  // concurrent outgoing connection limit
  http.globalAgent.maxSockets = Number.MAX_VALUE;

  var workers;
  var listening;
  var cpus = workers = listening = require('os').cpus().length;

  while (--workers >= 0) {
    cluster.fork();
  }

  cluster.on('listening', function (worker, address) {
    if (!(--listening)) {
      console.log('%d Express server(s) listening on port %d', cpus, port);
      console.log('Press Ctrl+C to exit...');
    }
  });

  cluster.on('exit', function (worker, code, signal) {
    var process = worker.process;
    console.log('Worker %s died (%s). Restarting...', process.pid, process.exitCode);
    cluster.fork();
  });
} else {
  http.createServer(require('./app')).listen(port);
}
