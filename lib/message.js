var mongoose = require('mongoose');

var messageModel = function () {

  var messageSchema = mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    created: { type: Date, default: Date.now },
    updated: { type: Date }
  });

  messageSchema.pre('update', function (next) {

    this.update = new Date();

    next();
  });

  return mongoose.model('Message', messageSchema);
};

module.exports = new messageModel();
