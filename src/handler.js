const BootBot = require('bootbot');
const config = require('../config');
const button = require('./helpers/button');
const response = require('./response');

/**
 * @class Handler
 * @classdesc Core initializer of chat bot.
 */
class Handler {
    constructor() {
        this.init = new BootBot({
            accessToken: config.tokens.messenger.accessToken,
            verifyToken: config.tokens.messenger.verifyToken,
            appSecret: config.tokens.messenger.appSecret
        });

        this.data = {
            services: [
                {title: "💵 Kredit", id: 1, flow: ["askAmount", "askSalary", "askPurpose"], type: 'postback'},
                {title: "💂 Sigorta", id: 2, flow: ["askSalary", "askAmount", "askPurpose"], type: 'postback'},
                {title: "✈️ Travel", id: 3, flow: ["askAmount", "askSalary"], type: 'postback'}
            ]
        }
    }

    main() {
        try {
            this.init.setGetStartedButton("GET_STARTED");

            const {services} = this.data;
            function triggerFlow(chat) {
                const askServices = (convo) => {
                    convo.ask({
                        text: `Maraqlandığınız məhsullarımızdan birini seçin:`,
                        buttons: button(services, "serviceID")
                    }, (payload, convo) => {
                        if(typeof payload.postback !== "undefined" && payload.postback.payload.indexOf("serviceID") !== -1) {
                            const text = payload.postback.title;
                            convo.set('service', text);
                            const service = services.filter((x) => x.title === text)[0];
                            response(service, convo)[service.flow[0]]();
                        } else {
                            convo.say("Məhsul seçin.").then(() => triggerFlow(chat));
                        }
                    });
                };

                chat.conversation((convo) => {
                    askServices(convo);
                });
            }

            this.init.on('message', (payload, chat) => {
                triggerFlow(chat);
            });

            this.init.on('postback:GET_STARTED', (payload, chat) => {
                triggerFlow(chat);
            });

            this.init.start(5000);
        } catch(ex) {
            console.log(`error: ${ex.toString()} @ handler.js`)
        }
    }
}

module.exports = new Handler().main();