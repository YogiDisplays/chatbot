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
        // Proceed to the next phase If there is one, If not, show the summary/result phase as the end of the conversation.
        function next(obj) {
            const {convo, service, text, serviceIndex, askType} = obj.payload;
            const {intReq} = obj.config;
            if (intReq && isNaN(text)) return convo.say(getString("intReq_err")).then(() => res(service, convo)[service.flow[serviceIndex]](service, convo));
            convo.set(askType, text); // Inserts the user input to the conversation tree. So, we can track and store it while conversation is active.
            return res(service, convo)[typeof service.flow[serviceIndex + 1] !== "undefined" ? service.flow[serviceIndex + 1] : "sendSummary"](service, convo);
        }

        // Recursive structure that enables to proceed to the next steps of flow.
        return {
            // This is the asking full name part. It validates the name and the character limits.
            askName: (service = s, convo = c) => {
                const serviceIndex = service.flow.indexOf("askName");
                convo.ask(trans("askName_qn"), (payload, convo) => {
                    if (typeof payload.message !== "undefined") {
                        const text = payload.message.text;
                        const nLimits = config.limits.name;
                        if (text.length < nLimits[1] && text.length > nLimits[0]) {
                            next({
                                payload: {convo, service, text, serviceIndex, askType: "full_name"},
                                config: {intReq: false}
                            });
                        } else {
                            convo.say(getString("invalidCharLimits_err", [nLimits[0], nLimits[1]])).then(() => res(service, convo)[service.flow[serviceIndex]](service, convo));
                        }
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
                            const sLimits = config.limits.salary;
                            const moneyValidation = money.isValid(text, sLimits);
                            if (!moneyValidation.comma) return convo.say(getString("invalidMoneyComma_err")).then(() => res(service, convo)[service.flow[serviceIndex]](service, convo));
                            if (!moneyValidation.limits) return convo.say(getString("invalidMoneyLimits_err", [sLimits[0], sLimits[1]])).then(() => res(service, convo)[service.flow[serviceIndex]](service, convo));
                            const amount = convo.get('amount');
                            if (Number(text) <= Number(amount) * 25 / 100) {
                                convo.say({
                                    text: getString("ineligibleCustomer_info", [service.title]),
                                    buttons: [
                                        {type: 'postback', title: getString("tryAgain_info"), payload: 'GET_STARTED'}
                                    ]
                                }).then(() => convo.end());
                            } else {
                                next({
                                    payload: {convo, service, text, serviceIndex, askType: "salary"},
                                    config: {intReq: true}
                                });
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

                        const sLimits = config.limits.loan;
                        const moneyValidation = money.isValid(text, sLimits);
                        if (!moneyValidation.comma) return convo.say(getString("invalidMoneyComma_err")).then(() => res(service, convo)[service.flow[serviceIndex]](service, convo));
                        if (!moneyValidation.limits) return convo.say(getString("invalidMoneyLimits_err", [sLimits[0], sLimits[1]])).then(() => res(service, convo)[service.flow[serviceIndex]](service, convo));
                        next({
                            payload: {convo, service, text, serviceIndex, askType: "amount"},
                            config: {intReq: true}
                        });
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
            // In this part, we're requesting an image as a attachment and then we're encoding it as base64 and sending to the our Python back-end that extracts specific texts like PIN.
            askID: (service = s, convo = c) => {
                const serviceIndex = service.flow.indexOf("askID");
                convo.ask(trans("askID_qn", [service.title]), (payload, convo) => {
                    if (typeof payload.message !== "undefined") {
                        if (typeof payload.message.attachments !== "undefined") {
                            if (payload.message.attachments[0].type === "image") {
                                const ID_url = payload.message.attachments[0].payload.url;
                                convo.say(getString("IDReceived_info")).then(() => {
                                    request.defaults({encoding: null}).get(ID_url, function (error, response, body) {
                                        if (!error && response.statusCode === 200) {
                                            const data = new Buffer(body).toString('base64');
                                            request({
                                                url: config.endpoints.pin,
                                                method: 'POST',
                                                json: {
                                                    image: data,
                                                    name: `${payload.sender.id}.${response.headers["content-type"].split('/')[1]}`
                                                }
                                            }, function (err, res, b) {
                                                next({
                                                    payload: {
                                                        convo,
                                                        service,
                                                        text: b.pin,
                                                        serviceIndex,
                                                        askType: "pin"
                                                    },
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
                convo.say({
                    text: `Təbriklər siz ${service.title} almaq haqqına sahibsiniz. Xahiş edirik ən yaxın filialımıza "${shortid.generate()}" müştəri kodu ilə yaxınlaşın.\nDaxil olunan məlumatlar:\n- Xidmət: ${service.title || "Boş"}\n- Ad, Soyad, Ata adı: ${convo.get('full_name') || "Boş"}\n- ${service.title} məbləği: ${convo.get('amount') || "Boş"}\n- Maaş: ${convo.get('salary') || "Boş"}\n- Səbəb: ${convo.get('purpose') || "Boş"}\n- Ş.V. FİN kodu: ${convo.get('pin') || "Boş"}`,
                    buttons: [
                        {type: 'postback', title: getString("tryAgain_info"), payload: 'GET_STARTED'}
                    ]
                }).then(() => convo.end());
            }
        }
    } catch (ex) {
        console.log(`error: ${ex.toString()} @ response.js`)
    }
}

module.exports = res;