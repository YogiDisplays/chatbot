const BootBot = require('bootbot');
const config = require('../config');
const button = require('./helpers/button');
const response = require('./response');

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
        this.init.on('message', (payload, chat) => {
            const askServices = (convo) => {
                convo.ask({
                    text: `Salam!\nMaraqlandığınız məhsullarımızdan birini seçin:`,
                    buttons: button(this.data.services, "serviceID")
                }, (payload, convo) => {
                    const text = payload.postback.title;
                    convo.set('service', text);
                    const service = this.data.services.filter((x) => x.title === text)[0];
                    response(service, convo)[service.flow[0]]();
                });
            };

            chat.conversation((convo) => {
                askServices(convo);
            });
        });

        this.init.start(5000);
    }
}

module.exports = new Handler().main();