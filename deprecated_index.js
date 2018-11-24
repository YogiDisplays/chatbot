const BootBot = require('bootbot');

const bot = new BootBot({
    accessToken: 'EAAOOZB2TZANngBAI7ST4UMli3JG5ZBq0NvKGAECrZCrUIzopouaC5iJec2wgm3VptnMcZADsrq284P7vNSLiKYRjzy9PDIZCFrovtwPdesvyZC7rmUnijZB5ZCxsCkYSjZB33gE3TCKKMvtYrFzrv7Ia7oK3hHSlAFJ2pOBnU5ohF1sQZDZD',
    verifyToken: 'fintech_token',
    appSecret: '66f6370d58713090b79ebbd3e4f2a821'
});

const conv_data = {
    services: [
        {title: "Kredit", id: 1, flow: ["askAmount", "askSalary", "askPurpose"], type: 'postback'},
        {title: "Sigorta", id: 2, flow: ["askSalary", "askAmount", "askPurpose"], type: 'postback'},
        {title: "Travel", id: 3, flow: ["askAmount", "askSalary"], type: 'postback'}
    ],
    translation: (action, v = null) => {
        switch (action) {
            case "askSalary_qn":
                return `Aylıq gəliriniz (AZN):`;
            case "askAmount_qn":
                return `${v[0]} məbləği (AZN):`;
            case "askPurpose_qn":
                return `Nə üçün ${v[0]} istəyirsiniz?`;
            case "askPurpose_btn":
                return [
                    {type: 'postback', id: 1, title: "Təhsil"},
                    {type: 'postback', id: 2, title: "Daşınmaz əmlak"},
                    {type: 'postback', id: 3, title: "Avtomobil"}
                ];
            default:
                return null;
        }
    }
};

const generateButton = (arr, pbName) => {
    let buttons = [];
    for (let x = 0; x < arr.length; x++) {
        const {title, id, type} = arr[x];
        buttons.push({type, title, payload: `${pbName}_${id}`})
    }
    return buttons;
};

function next(obj) {
    const {convo, service, text, serviceIndex, askType} = obj.payload;
    const {intReq} = obj.config;
    if(intReq && isNaN(text)) return convo.say("Yalnız rəqəm daxil edin (vergüldən istifadə etməyin)").then(() => service_methods(service, convo)[service.flow[serviceIndex]](service, convo));
    convo.set(askType, text);
    return service_methods(service, convo)[typeof service.flow[serviceIndex + 1] !== "undefined" ? service.flow[serviceIndex + 1] : "sendSummary"](service, convo);
}

function service_methods(s, c) {
    return {
        askSalary: (service = s, convo = c) => {
            const serviceIndex = service.flow.indexOf("askSalary");
            convo.ask(conv_data.translation("askSalary_qn"), (payload, convo) => {
                const text = payload.message.text;
                next({
                    payload: {convo, service, text, serviceIndex, askType: "salary"},
                    config: {intReq: true}
                });
            });
        },
        askAmount: (service = s, convo = c) => {
            const serviceIndex = service.flow.indexOf("askAmount");
            convo.ask(conv_data.translation("askAmount_qn", [service.title]), (payload, convo) => {
                const text = payload.message.text;
                next({
                    payload: {convo, service, text, serviceIndex, askType: "amount"},
                    config: {intReq: true}
                });
            });
        },
        askPurpose: (service = s, convo = c) => {
            const serviceIndex = service.flow.indexOf("askPurpose");
            convo.ask({
                text: conv_data.translation("askPurpose_qn", [service.title]),
                buttons: generateButton(conv_data.translation("askPurpose_btn"), "purposeID")
            }, (payload, convo) => {
                const text = payload.postback.title;
                next({
                    payload: {convo, service, text, serviceIndex, askType: "purpose"},
                    config: {intReq: false}
                });
            });
        },
        sendSummary: (service, convo) => {
            convo.say(`Təşəkkür edirik.\nDaxil olunan məlumatlar:\n- Xidmət: ${service.title || "Boş"}\n- Məbləğ: ${convo.get('amount') || "Boş"}\n- Maaş: ${convo.get('salary') || "Boş"}\n- Səbəb: ${convo.get('purpose') || "Boş"}`);
            convo.end();
        }
    }
}

bot.on('message', (payload, chat) => {
    const askServices = (convo) => {
        convo.ask({
            text: `Salam!\nMaraqlandığınız məhsullarımızdan birini seçin:`,
            buttons: generateButton(conv_data.services, "serviceID")
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