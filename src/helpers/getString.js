const config = require("../../config");

/**
 * @module getString
 * @description A static local text storage.
 */
module.exports = (s, v = null) => {
    // This module is like flowData but not related to the main flow texts. It provides errors and warnings that appears in the bot.
    // It supports dynamic templating inside of strings (optional).
    try {
        const stringList = {
            "chooseProduct_err": "🔴 Məhsul seçin.",
            "invalidMoneyComma_err": "🔴 Nöqtə və vergüldən istifadə etməyin.",
            "invalidMoneyLimits_err": `🔴 Ən az {0}, ən çox {1} ${config.currency} qəbul edilir. Xahiş edirik ki, yenidən yazasınız.`,
            "invalidCharLimits_err": "🔴 Ən az {0}, ən çox {1} simvol qəbul edilir. Xahiş edirik ki, yenidən yazasınız.",
            "intReq_err": "🔴 Yalnız rəqəm daxil edin (vergül və nöqtədən istifadə etməyin).",
            "invalidInput_err": "🔴 Düzgün məlumat qeyd edin.",
            "invalidFileType_err": "🖼 Göndərilən fayl, şəkil deyil.",
            "invalidIDCard_err": "🖼 Təqdim olunan şəxsiyyət vəsiqəsi təsdiqlənə bilmədi. Xahiş edirik yenidən daha keyfiyyətli formada ön hissənin şəkilini çəkib göndərəsiniz.",
            "networkIssue_err": "📶 Şəbəkə ilə rabitə problemi yaşandı. Xahiş edirik yenidən yoxlayasınız.",
            "chatTimeout_err": "⌛ Seans sonlandırıldı. İstənilən vaxt, yenidən başlaya bilərsiniz.",

            "chooseProduct_info": "Məhsullarımızdan birini seçin:",
            "ineligibleCustomer_info": "😔 Təəssüf ki, siz {0} almağa uyğun deyilsiniz.",
            "tryAgain_info": "🔁 Yenidən yoxla",
            "IDReceived_info": "✅ Qəbul edildi, gözləyin...",
            "sendFrontID_info": "💁 Zəhmət olmasa, şəxsiyyət vəsiqənizin ön tərəfinin şəkilini göndərin."
        };

        if(v != null) {
            let o_s = stringList[s];
            for(let x = 0; x < v.length; x++) {
                o_s = o_s.replace(`{${x}}`, v[x])
            }
            return o_s.toString();
        } else {
            return stringList[s].toString()
        }
    } catch (ex) {
        console.log(`error: ${ex.toString()} @ static.js`);
    }
};