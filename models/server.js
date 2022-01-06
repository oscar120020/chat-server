const express = require("express");
const http = require("http")
const socketio = require("socket.io")
const path = require("path");
const Sockets = require("./sockets");
const cors = require("cors")

class Server {
    constructor(){
        this.app = express();
        this.port = process.env.PORT;

        // http server
        this.server = http.createServer(this.app)

        // socket configuration
        this.io = socketio(this.server)

    }

    socketConfiguration(){
        new Sockets(this.io)
    }

    middlewares(){
        this.app.use(express.static(path.resolve(__dirname, "../public")))
        this.app.use(cors())
    }

    execute(){
        this.middlewares()

        // Socket configuration
        this.socketConfiguration()

        this.server.listen(this.port, () => {
            console.log("Serve running on port: ", this.port);
        })
    }
}


module.exports = Server;