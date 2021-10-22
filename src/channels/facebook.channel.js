module.exports = class Facebook {
  /**
   *
   * @param receiver
   * @param body
   * @returns
   */
  transform = async (receiver, body) => {
    let message = null;

    if (body.object == "page") {
      if (body.entry) {
        body.entry.forEach((entry) => {
          if (entry.messaging && entry.messaging[0].message) {
            let event = entry.messaging[0].message;
            if (event.quick_reply) {
              message = {
                type: "postback",
                postback: { ...event.quick_reply, title: event.text },
                timestamp: entry.messaging[0].timestamp,
                channel: "facebook",
                sender: entry.messaging[0].sender.id,
                receiver: receiver,
                botStrId: body.botStrId,
              };
            } else if (event.attachments) {
              message = {
                type: "attachment",
                attachment: {
                  url: event.attachments[0].payload.url,
                  type: event.attachments[0].type,
                },
                timestamp: entry.messaging[0].timestamp,
                channel: "facebook",
                sender: entry.messaging[0].sender.id,
                receiver: receiver,
                botStrId: body.botStrId,
              };
            } else {
              message = {
                type: "text",
                text: event.text,
                timestamp: entry.messaging[0].timestamp,
                channel: "facebook",
                sender: entry.messaging[0].sender.id,
                receiver: receiver,
                botStrId: body.botStrId,
              };
            }
          }
        });
      }
    }
    return message;
  };
  /**
   *
   * @param context
   * @param text
   * @param config
   * @returns
   */
  async text(text) {
    return { text: text };
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

      let quickReply = {
        content_type: "text",
        title: btn.title,
        payload,
      };

      quickReplies.push(quickReply);
    });
    let data = {
      text: text,
      quick_replies: quickReplies,
    };
    return data;
  }
};
