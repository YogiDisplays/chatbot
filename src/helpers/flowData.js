/**
 * @module flowData
 * @description A flow data container.
 */
module.exports = (action, v = null) => {
    switch (action) {
        case "askName_qn":
            return `Ad, Soyad, Ata adı:`;
        case "askSalary_qn":
            return `Aylıq gəliriniz (AZN):`;
        case "askAmount_qn":
            return `${v[0]} məbləği (AZN):`;
        case "askPurpose_qn":
            return `Nə üçün ${v[0]} istəyirsiniz?`;
        case "askID_qn":
            return `📷 Şəxsiyyət vəsiqənizin ön tərəfinin şəkilini Messenger vasitəsiylə göndərin.`;
        case "askPurpose_btn":
            return [
                {type: 'postback', id: 1, title: "🎓 Təhsil"},
                {type: 'postback', id: 2, title: "🏠 Daşınmaz əmlak"},
                {type: 'postback', id: 3, title: "🚘 Avtomobil"}
            ];
        default:
            return null;
    }
};