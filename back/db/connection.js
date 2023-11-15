const mongoose = require('mongoose');
const connection = async () => {
    try {
        const conn_Obj = await mongoose.connect(process.env.url, { useNewUrlParser: true, useUnifiedTopology: true })
        if (conn_Obj) {
            console.log("database connected");
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = connection
