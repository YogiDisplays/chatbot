'use strict';
const BootBot = require('bootbot');

const bot = new BootBot({
    accessToken: 'EAAOOZB2TZANngBAI7ST4UMli3JG5ZBq0NvKGAECrZCrUIzopouaC5iJec2wgm3VptnMcZADsrq284P7vNSLiKYRjzy9PDIZCFrovtwPdesvyZC7rmUnijZB5ZCxsCkYSjZB33gE3TCKKMvtYrFzrv7Ia7oK3hHSlAFJ2pOBnU5ohF1sQZDZD',
    verifyToken: 'fintech_token',
    appSecret: '66f6370d58713090b79ebbd3e4f2a821'
});

const conv_data = {
    services: [
        {name: "Kredit", id: 1, flow: ["askAmount", "askSalary"]},
        {name: "Sigorta", id: 2, flow: ["askSalary", "askAmount"]},
        {name: "Travel", id: 3, flow: ["askAmount", "askSalary"]}
    ],
    flow: {
        askAmount: {
            text: "Xahiş edirəm kredit məbləğini qeyd edin:",
            res_type: "int",
            ui: null,
            service_id: [1, 2]
        },
        askSalary: {
            text: "Aylıq gəlirinizi qeyd edin:",
            res_type: "int",
            ui: null,
            service_id: [1, 3]
        },
        askPurpose: {
            text: "Kredit alma səbəbi:",
            res_type: "string",
            ui: {
                type: "button",
                gui: ["Təhsil", "Daşınmaz əmlak", "Avtomobil"]
            },
            service_id: [1, 3]
        }
    }
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
                console.log(serviceIndex, "serviceIndex", serviceIndex === 0 ? service.flow.indexOf[serviceIndex+1] : "sendSummary");
                convo.say(`${service.name} məbləğ: ${text}`).then(() => service_methods(service, convo)[serviceIndex === 0 ? service.flow[serviceIndex+1] : "sendSummary"](service, convo));
            });
        },
        askAmount: (service = s, convo = c) => {
            const serviceIndex = service.flow.indexOf("askAmount");
            convo.ask(`Aylıq gəliriniz:`, (payload, convo) => {
                const text = payload.message.text;
                convo.set('salary', text);
                console.log(service, serviceIndex, "serviceIndex", service.flow.indexOf[serviceIndex+1]);
                convo.say(`Aylıq gəliriniz: ${text}`).then(() => service_methods(service, convo)[serviceIndex === 0 ? service.flow[serviceIndex+1] : "sendSummary"](service, convo));
            });
        },
        sendSummary: (service, convo) => {
            convo.say(`Məlumatlarınız:\n- Xidmət: ${service.name}\n- Məbləğ: ${convo.get('amount')}\n- Maaş: ${convo.get('salary')}`);
            convo.end();
        }
    }
}

bot.on('message', (payload, chat) => {
    const askServices = (convo) => {
        convo.ask({
            text: `Salam! Maraqlandığınız məhsullarımızdan birini seçin:`,
            buttons: serviceButtons()
        }, (payload, convo) => {
            const text = payload.postback.title;
            convo.set('service', text);
            convo.say(`${text} seçildi.`).then(() => {
                const service = conv_data.services.filter((x) => x.name === text)[0];
                service_methods(service, convo)[service.flow[0]]();
            });
        });
    };

    chat.conversation((convo) => {
        askServices(convo);
    });
});

bot.start(5000);