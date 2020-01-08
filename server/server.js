const express = require('express')
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 2001;

app.use(express.static(__dirname + '/public'))

io.on('connection', (socket) => {
    socket.emit('connected', 'CONNECTED!!!')

    socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));

    socket.on('draw-start', (data) => socket.broadcast.emit('draw-start', data));

    socket.on('clear-canvas', (data) => socket.broadcast.emit('clear-canvas', data));
    
    socket.on('save-image', (data) => socket.broadcast.emit('save-image', data));

})

http.listen(port, () => console.log(`Listening on port ${port}`))