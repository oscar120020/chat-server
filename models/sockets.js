const { userConnected, userDisconnected, getAllUsers, saveMessages } = require("../controllers/sockets");
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
            socket.join(uid)

            socket.on("inbox-message", async(payload) => {
                const message = await saveMessages(payload)
                this.io.to(payload.to).emit("inbox-message", message)
                this.io.to(payload.from).emit("inbox-message", message)
            })

            socket.on("writing", ({to, from, writing}) => {
                this.io.to(to).emit("writing", {writing, from})
            })

            socket.on("disconnect", async() => {
                await userDisconnected(uid)
                this.io.emit("user-list", await getAllUsers(uid))
            })

            this.io.emit("user-list", await getAllUsers(uid))
        });
    }
}

module.exports = Sockets