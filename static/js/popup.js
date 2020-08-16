function f(event){
    event.preventDefault();
    console.log();
    var win = window.open(event.currentTarget.getAttribute('href'), 'Change Client', 'height=500,width=800,resizable=yes,scrollbars=yes');
    win.focus();
};
document.querySelector('#change_id_owner_id').addEventListener('click',f);
document.querySelector('#add_id_owner_id').addEventListener('click',f);

