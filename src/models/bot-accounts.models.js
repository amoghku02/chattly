const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const botAccountSchema = new Schema({
    accessToken: {
        type: String,
    },
    channel: {
        type: String,
    },
    id: {
        type: String,
        generated: true
    },
    pageId: {
        type: String,
        required: true
    },
    botStrId: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: new Date().toISOString()
    },
    updatedAt: {
        type: Date,
        default: new Date().toISOString()
    },
    appUserId: {
        type: String
    }
});

const botAccounts = mongoose.model('bot-accounts', botAccountSchema);

const createAll = async (botId, userId, pages) => {
    for(let page of pages) {
        let existingAccount = await botAccounts.find({ botStrId: botId, pageId: page.id });
        console.log("existing", existingAccount)
        if(existingAccount && existingAccount.length > 0) {
            console.log(existingAccount[0]._id)
            await botAccounts.findByIdAndUpdate(existingAccount[0]._id, { accessToken: page.access_token, appUserId: userId, updatedAt: new Date().toISOString() })
        } else {
            await new botAccounts({
                accessToken: page.access_token,
                pageId: page.id,
                channel: page.type,
                botStrId: botId,
                appUserId: userId
            }).save()
        }
    }

    return true;
}

const getBotAccounts = async (channel, entityId) => {
    try{
        let botAccount = await botAccounts.find({ channel: channel, pageId: entityId});
        if(botAccount.length > 0)
            return botAccount[0];
        else
            return false;
    } catch (err) {
        console.log("error in get bot accounts", err.message);
        return false;
    }
}

module.exports = {createAll, getBotAccounts}