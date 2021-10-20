const express = require("express");
const router = express.Router();
const {getBotAccounts} = require("../models/bot-accounts.models");
const {fetchBot} = require("../models/bots.model");
const {processWebhook} = require("../helper/incoming-controller.helper");

router.get("/facebook/webhook", async (req, res) => {
    res.status(200).send(req.query["hub.challenge"]);
})

router.post("/:channel/webhook", async (req, res) => {
    console.log(JSON.stringify(req.body, null, 4));
    let channel = req.params.channel;
    let entityId;

    if(req.body && req.body.entry && req.body.entry[0] && req.body.entry[0].messaging) 
        entityId = req.body.entry[0].messaging[0].recipient.id;

    console.log("channel", channel, "entity id", entityId);

    let account = await getBotAccounts(channel, entityId);

    if(!account) 
        return res.status(400).send("No page found");
    
    let bot = await fetchBot(account.botStrId);

    if(!bot)
        return res.status(400).send("Bot not found");

    bot.bot_flow.tokenConfig = {
        "accessToken": account.accessToken,
    }
    
    req.body.botStrId = account.botStrId;
    req.body.receiver = account.pageId;
    req.body.botFlow = bot.bot_flow;

    // console.log("idhar aya", req.body.botStrId, req.body.botFlow);

    let response = await processWebhook(req);

    return res.status(200).send("mast");
})

module.exports = router;