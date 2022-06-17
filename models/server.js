const express = require("express");
const http = require("http")
const socketio = require("socket.io")
const path = require("path");
const Sockets = require("./sockets");
const cors = require("cors");
var multer = require('multer');
const fileUpload = require("express-fileupload")

const { dbConection } = require("../database/config");

class Server {
    constructor(){
        this.app = express();
        this.port = process.env.PORT;

        //BD Conection
        dbConection()

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
        this.app.use(express.json({limit: "20mb"}))
        this.app.use(fileUpload({
            useTempFiles: true,
            tempFileDir: "upload",
        }))

        //Routes
        this.app.use("/api/login", require("../routes/auth"))
        this.app.use("/api/messages", require("../routes/messages"))
        this.app.use("/api/groups", require("../routes/group"))
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