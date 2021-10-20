module.exports =  class Facebook {
      /**
       *
       * @param receiver
       * @param body
       *        {
                    "object":"facebook",
                    "entry":[
                        {
                            "time":1628583104802,
                            "id":"17841441303014378",
                            "messaging":[
                                {
                                    "sender":{
                                        "id":"4286339154731286"
                                    },
                                    "recipient":{
                                        "id":"17841441303014378"
                                    },
                                    "timestamp":1628583104197,
                                    "message":{
                                        "mid":"aWdfZAG1faXRlbToxOklHTWVzc2FnZAUlEOjE3ODQxNDQxMzAzMDE0Mzc4OjM0MDI4MjM2Njg0MTcxMDMwMDk0OTEyODE1NzQ4NzA3MTUxMzE0OTozMDA0MjA1NTcyNTg5ODQyNDcyNTE0MTg3OTQ0NTc4MjUyOAZDZD",
                                        "text":"some text"
                                    }
                                }
                            ]
                        }
                    ]
                }
    
                messaging: [
                  {
                    "sender": { "id": "4286339154731286" },
                    "recipient": { "id": "17841441303014378" },
                    "timestamp": 1628654295115,
                    "message": {
                      "mid": "aWdfZAG1faXRlbToxOklHTWVzc2FnZAUlEOjE3ODQxNDQxMzAzMDE0Mzc4OjM0MDI4MjM2Njg0MTcxMDMwMDk0OTEyODE1NzQ4NzA3MTUxMzE0OTozMDA0MzM2ODk2NjUzNTI4NDg1NDgxMTM5MDYwMDI4MjExMgZDZD",
                      "text": ". INFS - Ayurvedic ",
                      "quick_reply": { "payload": "PROD_DISC"}
                    }
                  }
                ]
    
    
                messaging: [
                  {
                    "sender": { "id": 4286339154731286 },
                    "recipient": { "id": 17841441303014378 },
                    "timestamp": "1628654377650",
                    "postback": {
                      "title": "Start Chatting",
                      "payload": "DEVELOPER_DEFINED_PAYLOAD"
                    }
                  }
                ]
    
                [
                  {
                    sender: { id: '4286339154731286' },
                    recipient: { id: '17841441303014378' },
                    timestamp: 1628654985887,
                    message: {
                      mid: 'aWdfZAG1faXRlbToxOklHTWVzc2FnZAUlEOjE3ODQxNDQxMzAzMDE0Mzc4OjM0MDI4MjM2Njg0MTcxMDMwMDk0OTEyODE1NzQ4NzA3MTUxMzE0OTozMDA0MzM4MTcwOTAyODczMzU4OTA3ODM4ODg0ODQ1OTc3NgZDZD',
                      attachments: [
                        {
                          type: 'image',
                          payload: {
                            url: 'https://lookaside.fbsbx.com/ig_messaging_cdn/?asset_id=17912353354878789&signature=Abxz11qUCpHH5ZUkeeZdtZOIZE8IhN8_aUQVxG7x_D3n_dRfHZ-M4QuhKsmDuctj1QmVFmYFwGWKQt0OybT8YKiVHBzAT6N7_hyz4Q_q4ddxvqDn7W4pYg2BosciNH0KhhUKVrjmjzsuT3u-v56KqlrZZu3f4XP2XblnHdbPo4mFZFdM'
                          }
                        }
                      ]
                    }
                  }
                ]
       * @returns
       */
      transform = async (receiver, body) => {
        let message = null;
    
        if (body.object == 'page') {
    
          if (body.entry) {
            body.entry.forEach((entry) => {
              if (entry.messaging && entry.messaging[0].message) {
                let event = entry.messaging[0].message;
                if (event.quick_reply) {
                  message = {
                    type: "postback",
                    postback: {...event.quick_reply, title: event.text},
                    timestamp: entry.messaging[0].timestamp,
                    channel: "facebook",
                    sender: entry.messaging[0].sender.id,
                    receiver: receiver,
                    botStrId: body.botStrId,
                  }
                } else if (event.attachments) {
                  message = {
                    type: "attachment",
                    attachment: {
                      url: event.attachments[0].payload.url,
                      type: event.attachments[0].type
                    },
                    timestamp: entry.messaging[0].timestamp,
                    channel: "facebook",
                    sender: entry.messaging[0].sender.id,
                    receiver: receiver,
                    botStrId: body.botStrId,
                  }
                } else {
                  message = {
                    type: "text",
                    text: event.text,
                    timestamp: entry.messaging[0].timestamp,
                    channel: "facebook",
                    sender: entry.messaging[0].sender.id,
                    receiver: receiver,
                    botStrId: body.botStrId,
                  }
                }
              }
            }
            )}
        }
        return message;
      }
      /**
       *
       * @param context
       * @param text
       * @param config
       * @returns
       */
      async text(text) {
        return {text: text};
      }
    
      /**
       *
       * @param context
       * @param qrJson
       * @returns
       */
      async quickReply(context, qrJson) {
        let text = qrJson["prompt"] + "\n\n";
        let buttons = qrJson["buttons"];
    
        let quickReplies = [];
    
    
        buttons.map((btn, indx) => {
          let payload = btn.id;
        //   if (btn.variables) {
        //     payload = "spl:" + new PayloadEncrypt().encrypt({
        //       "id": btn.id,
        //       "variables": btn.variables
        //     });
        //   }
    
          let quickReply = {
            "content_type": "text",
            "title": btn.title,
            payload
          };
    
          quickReplies.push(quickReply);
        })
        let data = {
          "text": text,
          "quick_replies": quickReplies
        }
        // await socket.sendToFacebook(context, data, "quickReply", qrJson);
        return data;
      }
    
    
    
      async cards(context, cards) {
        let cardElements = [];
        let imageElements = [];
        cards.map(async (card) => {
    
          if (card.title) {
            let buttons = [];
            card.buttons.map((btn) => {
              if (btn.type == 'url') {
                buttons.push({
                  type: "web_url",
                  url: btn.url,
                  title: btn.title
                })
              } else if (btn.type == "send") {
                buttons.push({
                  type: "postback",
                  title: btn.title,
                  payload: btn.id
                })
              }
            })
    
            let element = {
              title: card.title,
              subtitle: card.subtitle,
              image_url: card.image
            }
    
            if (buttons.length > 0) element.buttons = buttons;
            cardElements.push(element);
          } else {
            imageElements.push({
              url: card.image
            })
          }
        })
    
        if (cardElements.length > 0) {
          let data = {
            attachment: {
              type: "template",
              payload: {
                template_type: "generic",
                elements: cardElements
              }
            }
          }
    
          await socket.sendToFacebook(context, data, "cards", cards);
        }
    
        if (imageElements.length > 0) {
          imageElements.map(async (image) => {
            await this.image(context, image);
          })
        }
      }
    
      buttons(context, buttons) {
        throw new Error('buttons Method not implemented.');
      }
}