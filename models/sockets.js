class Sockets {
    constructor( io ){
        this.io = io;

        this.socketsEvents()
    }

    socketsEvents(){
        this.io.on('connection', ( socket ) => {
            console.log("socket running");
            socket.on("message-to-serve", (data) => {
                console.log(data);

                this.io.emit("message-from-serve", data)
            })
        });
    }
}

module.exports = Sockets