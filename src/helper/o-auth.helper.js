let axios = require("axios");

const getUserId = (token) => {
    return new Promise(async (resolve, reject) => {
        const inspectTokenConfig = {
            method: "get",
            url: `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${process.env.APP_TOKEN}`
        }

        try {
            let inspectTokenResponse = await axios(inspectTokenConfig);
            inspectTokenResponse = inspectTokenResponse.data;

            console.debug("inspect token response", JSON.stringify(inspectTokenResponse, null, 4));

            return resolve(inspectTokenResponse.data.user_id);
        } catch (error) {
            console.error("error while inspecting token", error.message);
            return resolve(false);
        }
    })
};

const getPageAccessToken = async (pageId, token) => {
    const pageTokenConfig = {
        method: "get",
        url: `https://graph.facebook.com/${pageId}?fields=access_token&access_token=${token}`
    }

    try {
        let tokenResponse = await axios(pageTokenConfig);
        tokenResponse = tokenResponse.data;

        return tokenResponse;
    } catch (error) {
        console.error("error in get page access token", error.message);
        return false;
    }
}

const subscribeApp = async (token, pageId) => {
    let subscribeConfig = {
        method: "post",
        url: `https://graph.facebook.com/v11.0/${pageId}/subscribed_apps?access_token=${token}&subscribed_fields=${process.env.SUBSCRIPTION_SCOPES}`
    }

    try {
        let subscribeResponse = await axios(subscribeConfig);
        subscribeResponse = subscribeResponse.data;
        console.log("subscribe response", subscribeResponse.data);
        return {
            access_token: token,
            id: pageId,
            type: "facebook"
        }
    } catch (error) {
        console.error("error in subscribe app", error.message);
        return false;
    }
}

module.exports = {
    getAccessToken: async (code) => {
        const accessTokenConfig = {
            method: 'get',
            url: `https://graph.facebook.com/v11.0/oauth/access_token?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&client_secret=${process.env.CLIENT_SECRET}&code=${code}`
        };

        try {
            let accessTokenResponse = await axios(accessTokenConfig);
            accessTokenResponse = accessTokenResponse.data;

            console.debug("user token response", JSON.stringify(accessTokenResponse, null, 4));

            let userId = await getUserId(accessTokenResponse.access_token);

            if (!userId) return false;

            accessTokenResponse.user_id = userId;
            return accessTokenResponse;
        } catch (error) {
            console.error("error in get access token", error.message);
            return false;
        }
    },

    getTokenAndSubscribeApp: async (token) => {
        const pageIdConfig = {
            method: "get",
            url: `https://graph.facebook.com/v11.0/me/accounts?access_token=${token}`
        }

        try {
            let tokenResponse = await axios(pageIdConfig);
            tokenResponse = tokenResponse.data;

            console.debug("page token response", JSON.stringify(tokenResponse, null, 4));

            let response = [];
            for (let i in tokenResponse.data) {
                let pageToken = await getPageAccessToken(tokenResponse.data[i].id, tokenResponse.data[i].access_token);
                if (pageToken) {
                    let facebookPage = await subscribeApp(pageToken.access_token, pageToken.id);
                    if (facebookPage) {
                        facebookPage.name = tokenResponse.data[i].name;

                        if (facebookPage.type == "facebook") {
                            response.push(facebookPage);

                            // let instagramPage = await getInstagramPage(page.id, pageToken.access_token);

                            // if (instagramPage) {
                            //     instagramPage.name = page.name;
                            //     response.push(instagramPage);
                            // }
                        }
                    }
                }
            }
            return response;
        } catch (error) {
            console.error("error in get token and subscribe", error.message);
            return false;
        }
    }
}