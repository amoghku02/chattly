const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Bots = new Schema({
    id: {
        type: String,
        generated: true
    },
    bot_accounts: {
        type: Array,
        required: true
    },
    bot_name: {
        type: String,
        required: true
    },
    bot_str_id: {
        type: String,
        required: true,
        unique: true
    },
    bot_flow: {
        type: Object,
        required: true
    }
});

const bots = mongoose.model('bots', Bots);

const fetchBot = async (botStrId) => {
    try{
        let bot = await bots.find({ bot_str_id: botStrId });
        if(bot.length > 0)
            return bot[0];
        else
            return false;
    } catch(err) {
        console.log("error in fetch bot", err.message);
        return false;
    }
}

const createBot = async (data) => {
    try{
        await new bots(data).save();
        return true;
    } catch(error) {
        console.error("error in createbots", error.message);
        return false;
    }
}

module.exports = {fetchBot, createBot}