var fs       = require('fs'),
    util     = require('util'),
    colors   = require('colors'),
    argv     = require('optimist').argv,
    restify  = require('restify'),
    database = require('./lib/database'),
    mongoPersister    = require('./lib/mongoPersister');;


var help = [
    "usage: node server [options] ",
    "",
    "Starts a contact server ",
    "",
    "options:",
    "  --port   PORT       Port that the xpush server should run on",
    "  --config OUTFILE    Location of the configuration file for the xpush server",
    "  -h, --help          You're staring at it"
].join('\n');

var welcome = [
"                      ",
" ┌─┐┌─┐┌┐┌┌┬┐┌─┐┌─┐┌┬┐",
" │  │ ││││ │ ├─┤│   │ ",
" └─┘└─┘┘└┘ ┴ ┴ ┴└─┘ ┴ ",
"     ┌─┐┌─┐┬─┐┬  ┬┌─┐┬─┐  ",
"     └─┐├┤ ├┬┘└┐┌┘├┤ ├┬┘  ",
"     └─┘└─┘┴└─ └┘ └─┘┴└─  ",
"                      "
].join('\n');


if (argv.h || argv.help || Object.keys(argv).length === 2 || !argv.config) {
  return util.puts(help);
}

var conf = {},
    port = argv.port || 8880;

try {
  var data = fs.readFileSync(argv.config);
  conf = JSON.parse(data.toString());
} catch (ex) {
  util.puts('Error starting xpush server: ' + ex);
  process.exit(1);
}

conf.port = port || conf.port;

database.config(
  conf && conf.mongodb && conf.mongodb.address ? conf.mongodb.address : '',
  'contact',
  function (err, message) {
    if(!err) console.info('  - Mongodb is connected');
  }
);

var server = restify.createServer();
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS( {origins: ['*:*']}));
server.use(restify.fullResponse());
server.use(restify.jsonp());

server.post('/message', function (req, res, next) {

  if(!req.params.app || !req.params.name || !req.params.email || !req.params.message){
    res.send({status: 'error', message: 'name, email and message must be supplied'});
    return;
  }

  mongoPersister.createMessage(
    req.params.app,
    req.params.name,
    req.params.email,
    req.params.message,
    function(err){
      if(err){
        res.send({status: 'error', message: err});
        return;
      }

      res.send({status: 'ok'});

    });

});

server.listen(conf.port, function () {
  util.puts(welcome.rainbow.bold);

  var startMessage = ' now listening on port: ' + conf.port;
  util.puts(startMessage.underline.bold.green + '\n');
  
});
