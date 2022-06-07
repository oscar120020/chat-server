const { userConnected, userDisconnected, getAllUsers, saveMessages, getGroups } = require("../controllers/sockets");
const { validateJWT } = require("../helpers/jwt");

class Sockets {
    constructor( io ){
        this.io = io;
        this.socketsEvents()
    }

    socketsEvents(){
        this.io.on('connection', ( socket ) => {
            socket.on("main-connection", async(token) => {
                const [valid, uid] = validateJWT(token)
                if(!valid){
                    console.log("socket no valid");
                    return socket.disconnect()
                }
                console.log("////////////usuario conectado");
                await userConnected(uid)
                socket.join(uid)
                this.io.emit("state")
    
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
                    this.io.emit("state")
                    console.log("***********usuario desconectado");
                })

                socket.on("state", async() => {
                    socket.emit("user-list", await getAllUsers(uid))
                    socket.emit("group-list", await getGroups(uid))
                })

                socket.on("user-change", ({to}) => {
                    this.io.to(to).emit("user-change")
                })

                socket.on("update-users", ({to}) => {
                    this.io.to(to).emit("update-users")
                })

                socket.on("connect-to-group", (uid) => {
                    socket.join(uid)
                })

                socket.emit("user-list", await getAllUsers(uid))
                socket.emit("group-list", await getGroups(uid))
            })
        });
    }
}

module.exports = Sockets