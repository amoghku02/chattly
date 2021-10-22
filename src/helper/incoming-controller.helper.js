const axios = require("axios");
const Facebook = require("../channels/facebook.channel");
const ipService = require("request-ip");
const fsm = require("fuzzy-string-matching");
const socket = require("./socket");
const res = require("express/lib/response");
const {create} = require("../models/messages.model");

const processStepReply = async (step, facebook, botFlow, transformed) => {
    if(step.reply.type == "text") {
        let data = await facebook.text(step.reply.text);
        console.log(data);
        await socket.sendToFacebook(botFlow.tokenConfig, data, transformed);
    } else if(step.reply.type == "quickReply") {
        let data = await facebook.quickReply(null, step.reply.quickReply);
        await socket.sendToFacebook(botFlow.tokenConfig, data, transformed);
    }
}

module.exports = {
    processWebhook: async (req) => {
        let facebook = new Facebook();
        let transformed = await facebook.transform(req.body.receiver, req.body);
        console.log(transformed);
        
        if(transformed) {
            let messageToSave = {
                "message": transformed.text ? transformed.text: JSON.stringify(transformed.postback),
                "message_type": transformed.text ? "text" : "postback",
                "message_transformed": transformed,
                "message_source": transformed.channel,
                "message_bot_id": transformed.botStrId,
            }

            await create(messageToSave);

            let ip = ipService.getClientIp(req);
            let botFlow = req.body.botFlow;
            let messageSend = false;
    
            if(transformed && transformed.text) {
                for(let step in botFlow.steps) {
                    let currStep = botFlow.steps[step];
                    
                    let shouldProcess = false;
                    currStep.uttrances.map(uttrance => {
                        if(fsm(transformed.text, uttrance.userSays) >= botFlow.threshold) 
                            shouldProcess = true;
                    })
    
                    if(shouldProcess) {
                        messageSend = true;
                        if(currStep.reply.type == "text") {
                            let data = await facebook.text(transformed.text);
                            await socket.sendToFacebook(botFlow.tokenConfig, data, transformed);
                        } else if(currStep.reply.type == "quickReply") {
                            let data = await facebook.quickReply(null, currStep.reply.quickReply);
                            await socket.sendToFacebook(botFlow.tokenConfig, data, transformed);
                        }
                        break;
                    }
    
                    
                } 
                if(!messageSend) {
                    console.log("sending fallback");
                    let data = await facebook.text(botFlow.fallback_text);
                    await socket.sendToFacebook(botFlow.tokenConfig, data, transformed);
                }
                
            } else if(transformed && transformed.postback) {
                // console.log("here", JSON.stringify(botFlow, null, 4));
                for(x in botFlow.steps) {
    
                    if(botFlow.steps[x].event == transformed.postback.payload) {
                        console.log(JSON.stringify(botFlow.steps[x]));
                        await processStepReply(botFlow.steps[x], facebook, botFlow, transformed);
                    }
                }
            }
            console.log(ip);

        }
        
    }
}