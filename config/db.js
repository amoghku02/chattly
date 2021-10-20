const mongoose = require('mongoose');
const db = require("./default.json").mongoURI;

const connectDB = async () => {
    try{
        await mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true});

        console.log('Database connected.....');
    }catch(err){
        console.error(err.message);
       
        //Exit process with failure

        process.exit(1);
    }
}

module.exports = connectDB;