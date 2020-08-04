function resolve_name(name, namelist, extra_field, counter = 0) {
    let name_resolved = counter == 0 ? name : `${name}_${counter}`;
    for (let i = 0; i < namelist.length; i++) {
        if (namelist[i][extra_field] === name_resolved) {
            return resolve_name(name, namelist, extra_field, counter + 1);
        }
    }
    return name_resolved; //?UT Done
}
function resolve_path(path){
    return path.split('/');
}
class APIHandler {
    constructor() {
        this.URLS = {
            manage_clients: '/api/clients/',
            manage_filepools: '/api/filepools/',
            manage_files: '/api/files/',
        };
        //remember to use ... (spread operator when using default URls)
    }
    async utils_fetch(url, request_method, body_data = null) {
        function getCookie(name) {
            let cookieValue = null;
            if (document.cookie && document.cookie !== '') {
                const cookies = document.cookie.split(';');
                for (let i = 0; i < cookies.length; i++) {
                    const cookie = cookies[i].trim();
                    // Does this cookie string begin with the name we want?
                    if (cookie.substring(0, name.length + 1) === (name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        }
        try{   
            if (request_method == 'GET') {
                let headers = {
                    'Content-Type': 'application/json'
                };
                const response = await fetch(url, { headers, });
                const response_json = await response.json();

                return response_json;
            }
            else if (request_method == 'DELETE'){
                const response = await fetch(url, {method: 'DELETE',})
                return true;
            }
            else if (request_method == 'POST' || request_method == 'PUT') {
                const csrftoken = getCookie('csrftoken');
                const defaults = {
                    'method': 'POST',
                    'credentials': 'same-origin',
                    'headers': new Headers({
                        'X-CSRFToken': csrftoken,
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'X-Requested-With': 'XMLHttpRequest'
                    }),
                    'body': JSON.parse(JSON.stringify(body_data)),
                };
                const response = await fetch(url, defaults);
                return true;
            }
        }catch(err){alert(err);return false}
    }
    //managing clients
    async get_client(client_id){
        const url = `${this.URLS.manage_clients}${client_id}/`;
        const get_response = await this.utils_fetch(url,'GET');
        return get_response;
    }
    async update_file_tree(json_file_tree,client_id){
        const url = `${this.URLS.manage_clients}${client_id}/`;
        const get_response = this.get_client(client_id);
        get_response.file_tree = json_file_tree;
        const maj_response=this.utils_fetch(url,'PUT',get_response);
        return maj_response;
    }
    //managing filepools
    async get_filepool(filepool_id){
        const url = `${this.URLS.manage_filepools}${filepool_id}/`;
        const get_response = await this.utils_fetch(url,'GET');
        return get_response;
    }

    async create_filepool(client_id , path){
        const url = this.URLS.manage_filepools;
        const response = await this.utils_fetch(url,'POST',{'client_id':client_id,'path':path});
        return response;
    }

    async delete_filepool(filepool_id){
        url = `${this.URLS.manage_filepools}${filepool_id}/`;
        const response = await this.utils_fetch(url,'DELETE');
        return response;
    }
    //managing files
    async get_file(file_id){
        const url = `${this.URLS.manage_files}${file_id}/`;
        const get_response = await this.utils_fetch(url,'GET');
        return get_response;
    }
    
    async get_files_by_filepool(filepool) {
        const url = `/api/files/?filepool=${filepool}&year=`;
        const get_response = await this.utils_fetch(url,'GET');
        return get_response;
    }

    async create_file(){
        //TODO: file input + get it's data using DOM then passing it to fetch body
    }
    async update_file(file_id,display_name=null,DOM_file_input_id=null ,filepool=null){
        // TODO: load current file path into the file_input
    }
    async delete_file(file_id){
        url = `${this.URLS.manage_files}${file_id}/`;
        const response = await this.utils_fetch(url,'DELETE');
        return response;
    }
}

class UT_APIHandler {
    constructor() {
        this.api_handler_instance = new APIHandler();
        this.get_test();
    }
    get_test(){
        console.log(this.api_handler_instance.get_client(2));
        console.log(this.api_handler_instance.get_filepool(2));
        console.log(this.api_handler_instance.get_file(2));
    }
}

let t = new UT_APIHandler();

class PathHandler {
    constructor(tree = null , api_handler_instance) {
        this.current_path = 'root';
        this.tree = tree != null ? JSON.parse(JSON.stringify(tree)) : init_tree();
        this.tree_copy = JSON.parse(JSON.stringify(this.tree));//is this one really usefull?
        this.node_template = {
            'display': 'String',
            'filepool': 'Number', //0 means node has no filepool
            'subtrees': 'Array',
        }
        this.api = api_handler_instance;
        this.callstack = [];
    }

    init_tree() {
        return {
            'display': 'root',
            'filepool': 0,
            'subtrees': [],
        }
    }

    reset_tree_copy() { this.tree_copy = JSON.parse(JSON.stringify(this.tree)); }
    save_tree_copy() { this.tree = JSON.parse(JSON.stringify(this.tree_copy)) }

    utils_validate_path(path) {
        path_regex = new RegExp('? ![_.])( ? !.*[_.] { 2 })[a - zA - Z0 - 9 _] + ( ? < ![_.]) $');
        const list = path.split('/');
        for (let elt in list) {
            if (!elt.match(path_regex)) {
                return false;
            }
        }
        return true;
    }

    convert_path_to_tree(path) {
        // returns null if the path doesn't exist else returns the sub_tree coresponding to the path
        // returns string if path or tree are invalid
        if (this.utils_validate_path(path) && this.utils_validate_tree()) {
            function _interpret_path(path_split_list, tree) {
                if (path_split_list.length == 1) { return tree } else {
                    for (let i = 0; i < tree['subtrees'].length; i++) {
                        if (tree['subtrees'][i]['display'] === path[1]) {
                            path_split_list.shift();
                            _interpret_path(path_split_list, tree['subtrees'][i])
                        }
                    }
                    // if the for block finds no match
                    return null;
                }
            }
            return _interpret_path(path.split('/'), this.tree_copy);
        }
        return 'path or file_tree are not valid';
    }

    utils_validate_tree() {} //validation crietirias { no duplicates on same directory , no name root}
    
    update_current_path(path){
        this.convert_path_to_tree(path);
        this.current_path = path;
    }

    utils_create_subtree(path, display, filepool) {
        if (typeof(display) == this.node_template['display'] && typeof(filepool) == this.node_template['display']) {
            function _create_node(tree, display, filepool) {
                counter = 0;
                display = resolve_name(display, tree['subtree'], 'display')
                const node = JSON.parse(JSON.stringify(this.node_template));
                node['display'] = display;
                node['filepool'] = filepool;
                tree['subtree'].push(node);
            }
            _create_node(this.convert_path_to_tree(path), display, filepool);
            return 'node created'
        }
        return 'The Types of arguments are different than the pathHandler.template settings'
    }
    utils_delete_subtree(path, display) {
        if (typeof(display) == this.node_template['display'] && typeof(filepool) == this.node_template['display']) {
            const del_filepool_id_collection = []

            function _disolute_subtree(tree, filepool_cleaning_bool, del_filepool_id_collection) {
                if (typeof(tree) == 'undefined') return;
                if (filepool_cleaning == true) {
                    if (tree['filepool'] != 0) {
                        del_filepool_id_collection.push(tree['filepool']);
                        for (let i = 0; i < tree['subtree'].length; i++) {
                            disolute_subtree(tree, filepool_cleaning_bool, del_filepool_id_collection);
                        }
                    }
                }
                //filepool_cleanning == false means all we have to do is manage the template JSON (file_tree JSON)
            }

            function _delete_subtree(tree, display, filepool_cleaning_bool, del_filepool_id_collection) {
                for (let i = 0; i < tree['subtree'].length; i++) {
                    if (tree['subtree'][i]['display'] === display) {
                        //splice(i, j) : starting at the index i delete j items
                        _disolute_subtree(tree['subtree'][i], filepool_cleaning_bool)
                        tree['subtree'].splice(i, 1);
                        break;
                    }
                }
            }
            _delete_node(this.convert_path_to_tree(path), display, true, del_filepool_id_collection);
            return 'subtree deleted!'
        }
        return 'The Types of arguments are different than the pathHandler.template settings'
    }
    utilis_update_subtree(path, display, new_display, new_filepool, new_subtrees) {
        if (typeof(display) == this.node_template['display'] && typeof(filepool) == this.node_template['display']) {
            {
                function _update_subtree(tree, display, new_display, filepool, subtrees) {
                    for (let i = 0; i < tree['subtrees'].length - 1; i++) {
                        if (tree['subtree'][i]['display'] === display) {
                            tree['subtree'][i]['display'] = new_display;
                            tree['subtree'][i]['filepool'] = new_filepool;
                            tree['subtree'][i]['subtree'] = new_subtrees;
                            break;
                        }
                    }
                }
                _update_subtree(this.convert_path_to_tree(path), display, new_display, new_filepool, new_subtrees)
            }
        }
    }

    display_current_tree() {
        const display_data = {
            dirs: [], //{'dir1','dir2'...}
            files: [] //{{id:...}(file JSON returned by API) }
        }

        async function _display_current_tree(tree, display_data) {

            display_data.files = await this.api.get_files_by_filepool(tree['filepool']);//promise
            for (let i = 0; i < tree['subtree'].length; i++) {
                display_data.dirs.push(tree['subtree'][i]['display']);
            }
        }
        _display_current_tree(this.convert_path_to_tree(this.current_path), display_data);
        return display_data;
    }
}

class UserInterfaceHandler {
    constructor(init_tree,api){
        this.api = api
        this.path_handler = new PathHandler(init_tree,this.api);
        this.template = {
            breadcrumb:(folder_name)=>`<a href="#" class="breadcrumb">${folder_name}</a>`,

            folder:(folder_name) =>`<div class="col s12 m4 l2" data="folder" data-name="${folder_name}">
            <div class="card  rounded button" style="display: flex">
                <div><i class="material-icons" style="padding:15px;">folder</i></div>
                <div>
                    <p style="padding:2px;">${folder_name}</p>
                </div>
                </div>
            </div>`,

            file:(file_name,download_link)=>`<div class="col s6 m3 l2" data="file">
            <div class="card">
                <div class="card-image" style="max-height: 100px;max-width: 100px;">
                    <img src="{% static 'img/pdf.jfif' %}" class="card-image-center">
                </div>
                <div class="card-content">
                    <p>${file_name}</p>
                </div>
                <div class="card-action">
                    <a href="${download_link}" download>Download</a>
                </div>
                </div>
            </div>`,
        };
        this.parents = {
            breadcrumbs:document.querySelector('div[data="wrap_breadcrumbs"]'),
            folders:document.querySelector('div[data="wrap_folders"]'),
            files:document.querySelector('div[data="wrap_files"]'),
        }
        this.create_user_layout();
    }
    manage_breadcrumbs(){
        const path_list = resolve_path(this.path_handler.current_path);
        for (let i =0 ; i<path_list.length -1 ; i++){
            // the last element in folder list is always an empty string
            this.parents.breadcrumbs.innerHTML += this.template.breadcrumb(path_list[i]);
        }
    }
    manage_folders(){
        const folders_list = this.path.display_current_tree().dirs;
        for (let i =0 ; i<folders_list.length ; i++){
            this.parents.folders.innerHTML += this.template.folder(folders_list[i]);
        }
    }
    manage_files(){
        const files_list = this.path.display_current_tree().files;
        for (let i =0 ; i<files_list.length ; i++){
            const elt = document.createElement('div');
            elt.innerHTML = this.template.file(files_list[i].display_name , files_list[i].file_path);
            elt.addEventListener('double-click',()=>{

            });
            this.parents.files.appendChild(elt);
        }
    }
    create_user_layout() {
        //step1: get current tree and parse it
        //step2: parse the curent path and update the breadcrumbs
        //step3: * create folders and files (using user_template object)
        //       * connect folders to events (using the Pathhandler Object) 
         
    }
}

class AdminInterfaceHandler{}

class InterfaceHandler{
    constructor(client,is_staff){
        this.api = new APIHandler()
        this.target_client = is_staff?0:client;
        this.is_staff = is_staff;
    }
    async update_UI(){
        if (this.is_staff){
            
        }
        else{
            //only init's the UserInterfaceHandler with some fetched data so it doesn't need to be fully async!
            const init_tree = await this.api.get_client(this.target_client).file_tree;
            const handler = UserInterfaceHandler(init_tree , api);
        }
         
    }
}









// let headers = {
//     'Content-Type': 'application/json'
// };
// fetch('/api/ClientInfo/all', {
//         headers,
//     })
//     .then(res => res.json())
//     .then(data => {
//         console.log(data);
//     });
// fetch('/api/').then(res => console.log(res.data))