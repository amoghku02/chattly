const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    message_id: {
        type: String,
        generated: true,
        id: true
    },
    message: {
        type: String,
        required: true
    },
    message_type: {
        type: String,
        default: "text"
    },
    message_transformed: {
        type: Object
    },
    message_source: {
        type: String,
    },
    message_bot_id: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: new Date().toISOString()
    },
    updated_at: {
        type: Date,
        default: new Date().toISOString()
    }
});

const Messages = mongoose.model("messages", messageSchema);

const create = async (message) => {
    try{
        let res = await new Messages(message).save();
        return true;
    } catch(err) {
        console.log("error in create message", err.message);
        return false;
    }
}

module.exports = {create};
