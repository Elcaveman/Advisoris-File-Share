// const pdf_image_url = "{% static 'img/pdf_icon.jfif' %}";
// const txt_image_url = "{% static 'img/txt_icon.png' %}";
// const xlsx_image_url = "{% static 'img/xlsx_icon.png' %}";
// const docx_image_url = "{% static 'img/docx_icon.png' %}";
// const other_image_url = "{% static 'img/other_icon.png' %}"
// or an <i> tag

function get_img(file_type){
    switch (file_type) {
        case 'pdf':
            return pdf_image_url
            break;
        case 'txt':
            return txt_image_url
            break;
        case 'xls':
        case 'xlsx':
            return xlsx_image_url
            break;

        case 'doc':
        case 'docx':
            return docx_image_url
            break;
        
        default:
            return other_image_url
            break;
    }
}
function dismissChangeRelatedObjectPopup(win, objId, newRepr, newId) {
    win.close();
}