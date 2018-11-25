module.exports = (s, v = null) => {
    try {
        const stringList = {
            "chooseProduct_err": "Məhsul seçin.",
            "invalidMoneyComma_err": "Nöqtə və vergüldən istifadə etməyin.",
            "invalidMoneyLimits_err": "Limiti keçdiniz. Məbləğ limitləri: minimum {0}, maksimum {1}",
            "invalidCharLimits_err": "Limiti keçdiniz. Simvol limitləri: minimum {0}, maksimum {1}",
            "intReq_err": "Yalnız rəqəm daxil edin (vergüldən istifadə etməyin).",
            "invalidInput_err": "Düzgün məlumat qeyd edin.",
            "invalidFileType_err": "Göndərilən fayl, şəkil deyil.",

            "chooseProduct_info": "Maraqlandığınız məhsullarımızdan birini seçin:",
            "ineligibleCustomer_info": "Təəssüf ki, siz {0} almağa uyğun deyilsiniz.",
            "tryAgain_info": "🔁 Yenidən yoxla",
            "IDReceived_info": "Qəbul edildi, gözləyin...",
            "sendFrontID_info": "Zəhmət olmasa, şəxsiyyət vəsiqənizin ön tərəfinin şəkilini göndərin."
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