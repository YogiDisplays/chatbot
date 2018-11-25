const BootBot = require('bootbot');
const config = require('../config');
const button = require('./helpers/button');
const getString = require('./helpers/getString');
const response = require('./response');

/**
 * @class Handler
 * @classdesc Core initializer of chat bot.
 */
class Handler {
    constructor() {
        // Initializing BootBot 3rd party lib with the specific tokens.
        this.init = new BootBot({
            accessToken: config.tokens.messenger.accessToken,
            verifyToken: config.tokens.messenger.verifyToken,
            appSecret: config.tokens.messenger.appSecret
        });

        // The main bank product menus that will be show up in the first interaction.
        // This contains menu button credentials and flow array that provides order of the flow stages.
        this.data = {
            services: [
                {title: "💵 Kredit", id: 1, flow: ["askName", "askAmount", "askSalary", "askID", "askPurpose"], type: 'postback'},
                {title: "❤️ Siğorta", id: 2, flow: ["askSalary", "askPurpose"], type: 'postback'},
                {title: "✈️ Səyahət", id: 3, flow: ["askAmount", "askSalary"], type: 'postback'}
            ]
        }
    }

    main() {
        try {
            // Adding and enabling Get Started button in Messenger.
            // When users finds our bot, they can press to Get Started button without typing anything.
            this.init.setGetStartedButton("GET_STARTED");

            // Initial flow trigger that triggers the menu.
            const {services} = this.data;
            function triggerFlow(chat) {
                const askServices = (convo) => {
                    convo.ask({
                        text: getString("chooseProduct_info"),
                        buttons: button(services, "serviceID")
                    }, (payload, convo) => {
                        if(typeof payload.postback !== "undefined" && payload.postback.payload.indexOf("serviceID") !== -1) { // Checking states of the payload variables.
                            const text = payload.postback.title;
                            convo.set('service', text); // Inserts the user input to the conversation tree. So, we can track and store it while conversation is active.
                            const service = services.filter((x) => x.title === text)[0];
                            response(service, convo)[service.flow[0]](); // Proceeds to the next flow phase If everything is alright.
                        } else {
                            convo.say(getString("chooseProduct_err")).then(() => triggerFlow(chat)); // When we don't expect the data type that we should receive.
                        }
                    });
                };

                // Adding askServices to conversation so it can continue to the next phases after doing its job.
                chat.conversation((convo) => {
                    askServices(convo);
                });
            }

            // When users types anything that contains characters, this fires flow chapter to start the process.
            this.init.on('message', (payload, chat) => {
                triggerFlow(chat);
            });

            // Same as here. This postback is for only the Get Started button that appears in the first interaction once.
            this.init.on('postback:GET_STARTED', (payload, chat) => {
                triggerFlow(chat);
            });

            // Starting the bot server and listening to 5000 port.
            this.init.start(5000);
        } catch(ex) {
            console.log(`error: ${ex.toString()} @ handler.js`)
        }
    }
}

module.exports = new Handler().main();