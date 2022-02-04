const mongoose = require("mongoose")

const dbConection = async() => {
    try {
        await mongoose.connect(process.env.DB_URI)

        console.log("DB online");

    } catch (error) {
        throw new Error("Error en la base de datos", error)
    }
}

module.exports = {
    dbConection
}