const express = require("express");
const router = express.Router();
let oAuthHelper = require("../helper/o-auth.helper");
const {createAll} = require("../models/bot-accounts.models");
/**
 * Route to install facebook pages
 */
router.get('/install/:botId', async (req, res) => {
    let botId = req.params.botId;
    let installUri = `https://www.facebook.com/dialog/oauth?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&scope=${process.env.SCOPE}&state=${botId}`;
    console.debug("redirecting to", installUri);
    res.redirect(installUri);
})

/**
 * Callback route for facebook oauth
 */
router.get('/callback', async (req, res) => {
    let code = req.query.code;
    let botId = req.query.state;

    let tokenData = await oAuthHelper.getAccessToken(code);

    let data = await oAuthHelper.getTokenAndSubscribeApp(tokenData.access_token);
    
    if(!data) return res.status(500).send("Internal Server Error");

    data = {
        user_id: tokenData.user_id,
        pages: data
    };

    try{
        await createAll(botId, data.user_id, data.pages);
        return res.status(200).send(data);
    } catch (error) {
        console.error(error.message);
        return res.status(500).send("Internal Server Error");
    }

})

module.exports = router;
