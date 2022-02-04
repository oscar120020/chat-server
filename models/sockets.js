const { userConnected, userDisconnected, getAllUsers } = require("../controllers/sockets");
const { validateJWT } = require("../helpers/jwt");

class Sockets {
    constructor( io ){
        this.io = io;

        this.socketsEvents()
    }

    socketsEvents(){
        this.io.on('connection', async( socket ) => {
            const [valid, uid] = validateJWT(socket.handshake.query["x-token"])
            if(!valid){
                console.log("socket no valid");
                return socket.disconnect()
            }
            await userConnected(uid)

            socket.on("disconnect", async() => {
                await userDisconnected(uid)
                this.io.emit("user-list", await getAllUsers(uid))
            })

            this.io.emit("user-list", await getAllUsers(uid))
        });
    }
}

module.exports = Sockets