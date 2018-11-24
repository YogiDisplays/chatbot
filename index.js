'use strict';
const BootBot = require('bootbot');

const bot = new BootBot({
    accessToken: 'EAAOOZB2TZANngBAI7ST4UMli3JG5ZBq0NvKGAECrZCrUIzopouaC5iJec2wgm3VptnMcZADsrq284P7vNSLiKYRjzy9PDIZCFrovtwPdesvyZC7rmUnijZB5ZCxsCkYSjZB33gE3TCKKMvtYrFzrv7Ia7oK3hHSlAFJ2pOBnU5ohF1sQZDZD',
    verifyToken: 'fintech_token',
    appSecret: '66f6370d58713090b79ebbd3e4f2a821'
});

const conv_data = {
    services: [
        {name: "Kredit", id: 1, flow: ["askAmount", "askSalary", "askPurpose"]},
        {name: "Sigorta", id: 2, flow: ["askSalary", "askAmount", "askPurpose"]},
        {name: "Travel", id: 3, flow: ["askAmount", "askSalary"]}
    ]
};

const serviceButtons = () => {
    let buttons = [];
    for(let x = 0; x < conv_data.services.length; x++) {
        const {name, id} = conv_data.services[x];
        buttons.push({ type: 'postback', title: name, payload: `serviceID_${id}` })
    }
    return buttons;
};

function service_methods (s, c) {
    return {
        askSalary: (service = s, convo = c) => {
            const serviceIndex = service.flow.indexOf("askSalary");
            convo.ask(`Almaq istədiyiniz məbləğ:`, (payload, convo) => {
                const text = payload.message.text;
                convo.set('amount', text);
                service_methods(service, convo)[typeof service.flow[serviceIndex+1] !== "undefined" ? service.flow[serviceIndex+1] : "sendSummary"](service, convo);
            });
        },
        askAmount: (service = s, convo = c) => {
            const serviceIndex = service.flow.indexOf("askAmount");
            convo.ask(`Aylıq gəliriniz:`, (payload, convo) => {
                const text = payload.message.text;
                convo.set('salary', text);
                service_methods(service, convo)[typeof service.flow[serviceIndex+1] !== "undefined" ? service.flow[serviceIndex+1] : "sendSummary"](service, convo);
            });
        },
        askPurpose: (service = s, convo = c) => {
            const serviceIndex = service.flow.indexOf("askPurpose");
            convo.ask({
                text: `Nə üçün ${service.name} istəyirsiniz?`,
                buttons: [
                    { type: 'postback', title: "Təhsil", payload: `purposeID_1` },
                    { type: 'postback', title: "Daşınmaz əmlak", payload: `purposeID_2` },
                    { type: 'postback', title: "Avtomobil", payload: `purposeID_3` }
                ]
            }, (payload, convo) => {
                const text = payload.postback.title;
                convo.set('purpose', text);
                service_methods(service, convo)[typeof service.flow[serviceIndex+1] !== "undefined" ? service.flow[serviceIndex+1] : "sendSummary"](service, convo);
            });
        },
        sendSummary: (service, convo) => {
            convo.say(`Məlumatlarınız:\n- Xidmət: ${service.name}\n- Məbləğ: ${convo.get('amount')}\n- Maaş: ${convo.get('salary')}\n- Səbəb: ${convo.get('purpose')}`);
            convo.end();
        }
    }
}

bot.on('message', (payload, chat) => {
    const askServices = (convo) => {
        convo.ask({
            text: `Salam!\nMaraqlandığınız məhsullarımızdan birini seçin:`,
            buttons: serviceButtons()
        }, (payload, convo) => {
            const text = payload.postback.title;
            convo.set('service', text);
            const service = conv_data.services.filter((x) => x.name === text)[0];
            service_methods(service, convo)[service.flow[0]]();
        });
    };

    chat.conversation((convo) => {
        askServices(convo);
    });
});

bot.start(5000);