'use strict';

module.exports = function (nsp, io) {

  nsp.on('connection', function (socket) {

      console.log("A user connected");

      socket.on('disconnect', function () {
        console.log("A user disconnected");
      });

      socket.on('join', function(room) {
        socket.join(room);
        socket.emit('joined');
      });
    });

};
