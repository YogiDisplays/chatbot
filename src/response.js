const request = require('request');
const shortid = require('shortid');
const button = require("./helpers/button");
const trans = require("./helpers/flowData");
const money = require("./helpers/money");
const getString = require("./helpers/getString");
const config = require("../config");

/**
 * @function Response
 * @description Recursive flow manager.
 */
function res(s, c) {
    try {
        // Proceed to the next phase If there is one, If not, show the summary/result phase to end it.
        function next(obj) {
            const {convo, service, text, serviceIndex, askType} = obj.payload;
            const {intReq} = obj.config;
            if (intReq && isNaN(text)) return convo.say(getString("intReq_err")).then(() => res(service, convo)[service.flow[serviceIndex]](service, convo));
            convo.set(askType, text);
            return res(service, convo)[typeof service.flow[serviceIndex + 1] !== "undefined" ? service.flow[serviceIndex + 1] : "sendSummary"](service, convo);
        }

        return {
            askName: (service = s, convo = c) => {
                const serviceIndex = service.flow.indexOf("askName");
                convo.ask(trans("askName_qn"), (payload, convo) => {
                    if (typeof payload.message !== "undefined") {
                        const text = payload.message.text;
                        next({
                            payload: {convo, service, text, serviceIndex, askType: "full_name"},
                            config: {intReq: false}
                        });
                    } else {
                        convo.say(getString("invalidInput_err")).then(() => res(service, convo)[service.flow[serviceIndex]](service, convo));
                    }
                });
            },
            askSalary: (service = s, convo = c) => {
                const serviceIndex = service.flow.indexOf("askSalary");
                convo.ask(trans("askSalary_qn"), (payload, convo) => {
                    if (typeof payload.message !== "undefined") {
                        const text = payload.message.text;
                        if (service.id === 1) {
                            if (money.isValid(text)) {
                                const amount = convo.get('amount');
                                if (Number(text) <= Number(amount) * 25 / 100) {
                                    convo.say({
                                        text: getString("ineligibleCustomer_info", [service.title]),
                                        buttons: [
                                            { type: 'postback', title: getString("tryAgain_info"), payload: 'GET_STARTED' }
                                        ]
                                    }).then(() => convo.end());
                                } else {
                                    next({
                                        payload: {convo, service, text, serviceIndex, askType: "salary"},
                                        config: {intReq: true}
                                    });
                                }
                            } else {
                                convo.say(getString("invalidMoney_err")).then(() => res(service, convo)[service.flow[serviceIndex]](service, convo));
                            }
                        } else {
                            next({
                                payload: {convo, service, text, serviceIndex, askType: "salary"},
                                config: {intReq: true}
                            });
                        }
                    } else {
                        convo.say(getString("invalidInput_err")).then(() => res(service, convo)[service.flow[serviceIndex]](service, convo));
                    }
                });
            },
            askAmount: (service = s, convo = c) => {
                const serviceIndex = service.flow.indexOf("askAmount");
                convo.ask(trans("askAmount_qn", [service.title]), (payload, convo) => {
                    if (typeof payload.message !== "undefined") {
                        const text = payload.message.text;
                        if (money.isValid(text)) {
                            next({
                                payload: {convo, service, text, serviceIndex, askType: "amount"},
                                config: {intReq: true}
                            });
                        } else {
                            convo.say(getString("invalidMoney_err")).then(() => res(service, convo)[service.flow[serviceIndex]](service, convo));
                        }
                    } else {
                        convo.say(getString("invalidInput_err")).then(() => res(service, convo)[service.flow[serviceIndex]](service, convo));
                    }
                });
            },
            askPurpose: (service = s, convo = c) => {
                const serviceIndex = service.flow.indexOf("askPurpose");
                convo.ask({
                    text: trans("askPurpose_qn", [service.title]),
                    buttons: button(trans("askPurpose_btn"), "purposeID")
                }, (payload, convo) => {
                    if (typeof payload.postback !== "undefined") {
                        const text = payload.postback.title;
                        next({
                            payload: {convo, service, text, serviceIndex, askType: "purpose"},
                            config: {intReq: false}
                        });
                    } else {
                        convo.say(getString("invalidInput_err")).then(() => res(service, convo)[service.flow[serviceIndex]](service, convo));
                    }
                });
            },
            askID: (service = s, convo = c) => {
                const serviceIndex = service.flow.indexOf("askID");
                convo.ask(trans("askID_qn", [service.title]), (payload, convo) => {
                    if (typeof payload.message !== "undefined") {
                        if (typeof payload.message.attachments !== "undefined") {
                            if (payload.message.attachments[0].type === "image") {
                                const ID_url = payload.message.attachments[0].payload.url;
                                convo.say(getString("IDReceived_info")).then(() => {
                                    request.defaults({ encoding: null }).get(ID_url, function (error, response, body) {
                                        if (!error && response.statusCode === 200) {
                                            const data = new Buffer(body).toString('base64');
                                            request({
                                                url: config.endpoints.pin,
                                                method: 'POST',
                                                json: {image: data, name: `${payload.sender.id}.${response.headers["content-type"].split('/')[1]}`}
                                            }, function(err, res, b){
                                                next({
                                                    payload: {convo, service, text: b.pin, serviceIndex, askType: "pin"},
                                                    config: {intReq: false}
                                                });
                                            });
                                        }
                                    });
                                })
                            } else {
                                convo.say(getString("invalidFileType_err")).then(() => res(service, convo)[service.flow[serviceIndex]](service, convo));
                            }
                        } else {
                            convo.say(getString("sendFrontID_info")).then(() => res(service, convo)[service.flow[serviceIndex]](service, convo));
                        }
                    } else {
                        convo.say(getString("sendFrontID_info")).then(() => res(service, convo)[service.flow[serviceIndex]](service, convo));
                    }
                });
            },
            sendSummary: (service, convo) => {
                convo.say(`Təbriklər siz ${service.title} almaq haqqına sahibsiniz. Xahiş edirik ən yaxın filialımıza ${shortid.generate()} müştəri kodu ilə yaxınlaşın.\nDaxil olunan məlumatlar:\n- Xidmət: ${service.title || "Boş"}\n- Ad, Soyad, Ata adı: ${convo.get('full_name') || "Boş"}\n- Məbləğ: ${convo.get('amount') || "Boş"}\n- Maaş: ${convo.get('salary') || "Boş"}\n- Səbəb: ${convo.get('purpose') || "Boş"}\n- Vəsiqə FİN kod: ${convo.get('pin') || "Boş"}`);
                convo.end();
            }
        }
    } catch (ex) {
        console.log(`error: ${ex.toString()} @ response.js`)
    }
}

module.exports = res;