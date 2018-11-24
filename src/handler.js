const BootBot = require('bootbot');
const button = require('./helpers/button');
const response = require('./response');

class Handler {
    constructor() {
        this.init = new BootBot({
            accessToken: 'EAAOOZB2TZANngBAI7ST4UMli3JG5ZBq0NvKGAECrZCrUIzopouaC5iJec2wgm3VptnMcZADsrq284P7vNSLiKYRjzy9PDIZCFrovtwPdesvyZC7rmUnijZB5ZCxsCkYSjZB33gE3TCKKMvtYrFzrv7Ia7oK3hHSlAFJ2pOBnU5ohF1sQZDZD',
            verifyToken: 'fintech_token',
            appSecret: '66f6370d58713090b79ebbd3e4f2a821'
        });

        this.data = {
            services: [
                {title: "Kredit", id: 1, flow: ["askAmount", "askSalary", "askPurpose"], type: 'postback'},
                {title: "Sigorta", id: 2, flow: ["askSalary", "askAmount", "askPurpose"], type: 'postback'},
                {title: "Travel", id: 3, flow: ["askAmount", "askSalary"], type: 'postback'}
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