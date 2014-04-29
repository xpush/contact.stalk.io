var Message  = require('./message');

exports.createMessage = function (_app, _name, _email, _message, done) {

  var _m = new Message({
    app        : _app,
    name       : _name,
    email      : _email,
    message    : _message
  });

  if(done){
    _m.save(done);
  }else{
    _m.save();
  }

};
