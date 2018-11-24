const button = require("./helpers/button");
const trans = require("./helpers/translation");

function res(s, c) {
    function next(obj) {
        const {convo, service, text, serviceIndex, askType} = obj.payload;
        const {intReq} = obj.config;
        if(intReq && isNaN(text)) return convo.say("Yalnız rəqəm daxil edin (vergüldən istifadə etməyin)").then(() => res(service, convo)[service.flow[serviceIndex]](service, convo));
        convo.set(askType, text);
        return res(service, convo)[typeof service.flow[serviceIndex + 1] !== "undefined" ? service.flow[serviceIndex + 1] : "sendSummary"](service, convo);
    }

    return {
        askSalary: (service = s, convo = c) => {
            const serviceIndex = service.flow.indexOf("askSalary");
            convo.ask(trans("askSalary_qn"), (payload, convo) => {
                const text = payload.message.text;
                next({
                    payload: {convo, service, text, serviceIndex, askType: "salary"},
                    config: {intReq: true}
                });
            });
        },
        askAmount: (service = s, convo = c) => {
            const serviceIndex = service.flow.indexOf("askAmount");
            convo.ask(trans("askAmount_qn", [service.title]), (payload, convo) => {
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
                text: trans("askPurpose_qn", [service.title]),
                buttons: button(trans("askPurpose_btn"), "purposeID")
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

module.exports = res;