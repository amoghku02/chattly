const emoji = require("node-emoji");
const axios = require("axios");

module.exports = {
    sendToFacebook: async (config, data, formatted_message) => {

        let token = config.accessToken;
        let sender = formatted_message.sender;
        
        var sktServerData = {};
    
        sktServerData.message = data;
        sktServerData.recipient = {
        "id": sender
        };
        
    
    
        // console.log("sktServerData", JSON.stringify(sktServerData, null, 4));
    
        let reqOptions = {
          url: `https://graph.facebook.com/${process.env.FACEBOOK_GRAPH}/${formatted_message.receiver}/messages?access_token=${token}`,
          data: sktServerData,
          method: 'post',
        };
    
        reqOptions = JSON.parse(emoji.emojify(JSON.stringify(reqOptions)));
    
        try{
            let response = await axios(reqOptions);
    
            // console.log(response.data);
            return response.data;
        } catch(err) {
            console.log("error in send to facebook", err.message);
            return false;
        }
    
    }
}