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
    const list = path.split('/');
    list.pop(); 
    return list;
}
function assemble_path(list,start,end){
    // [|start,end|] is the interval
    let result = '';
    for (let i =start%(list.length); i<= end%(list.length) ; i++){
        result +=`${list[i]}/`;
    }
    return result;
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
        if (filepool!=0){
        const url = `/api/files/?filepool=${filepool}&year=`;
        const get_response = await this.utils_fetch(url,'GET');
        return get_response;
    }
        return [];
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

// class UT_APIHandler {
//     constructor() {
//         this.api_handler_instance = new APIHandler();
//         this.get_test();
//     }
//     get_test(){
//         console.log(this.api_handler_instance.get_client(2));
//         console.log(this.api_handler_instance.get_filepool(2));
//         console.log(this.api_handler_instance.get_file(2));
//     }
// }

// let t = new UT_APIHandler();

class PathHandler {
    constructor(tree = null , api_handler_instance) {
        this.current_path = 'Root/';
        this.tree = tree != null ? JSON.parse(JSON.stringify(tree)) : this.init_tree();//used for transaction with api
        this.tree_copy = JSON.parse(this.tree);//used for transactions with front_end

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
        // path_regex = new RegExp('? ![_.])( ? !.*[_.] { 2 })[a - zA - Z0 - 9 _] + ( ? < ![_.]) $');
        // const list = path.split('/');
        // for (let elt in list) {
        //     if (!elt.match(path_regex)) {
        //         return false;
        //     }
        // }
        return true;
    }

    convert_path_to_tree(path_=null) {
        //!UT done
        // returns null if the path doesn't exist else returns the sub_tree coresponding to the path
        // returns string if path or tree are invalid
        const path = path_== null?this.current_path:path_
        if (this.utils_validate_path(path) && this.utils_validate_tree()) {
            function _interpret_path(resolved_path , tree){
                if (resolved_path.length==0) {return null};
                if (tree['display'] === resolved_path[0]){
                    if (resolved_path.length === 1) {return tree;}
                    else{
                        resolved_path.shift();
                        for (let i =0 ; i<tree['subtrees'].length ; i++){
                            let tr= _interpret_path(resolved_path , tree['subtrees'][i])
                            if (tr){
                                // once a tree is found we stop searching
                                return tr;
                            };
                        } 
                    }
                }
            }
            return _interpret_path(resolve_path(path), this.tree_copy);
        }
        return 'path or file_tree are not valid';
    }

    utils_validate_tree() {return true;} //validation crietirias { no duplicates on same directory , no name root}
    
    update_current_path(path){
        this.current_path = path;
        return this.convert_path_to_tree();
    }

    utils_create_subtree(path=null, display, filepool) {
        if (typeof(display) == this.node_template['display'] && typeof(filepool) == this.node_template['display']) {
            function _create_node(tree, display, filepool) {
                counter = 0;
                display = resolve_name(display, tree['subtrees'], 'display')
                const node = JSON.parse(JSON.stringify(this.node_template));
                node['display'] = display;
                node['filepool'] = filepool;
                tree['subtrees'].push(node);
            }
            _create_node(this.convert_path_to_tree(path), display, filepool);
            return 'node created'
        }
        return 'The Types of arguments are different than the pathHandler.template settings'
    }
    utils_delete_subtree(path=null, display) {
        if (typeof(display) == this.node_template['display'] && typeof(filepool) == this.node_template['display']) {
            const del_filepool_id_collection = []

            function _disolute_subtree(tree, filepool_cleaning_bool, del_filepool_id_collection) {
                if (typeof(tree) == 'undefined') return;
                if (filepool_cleaning == true) {
                    if (tree['filepool'] != 0) {
                        del_filepool_id_collection.push(tree['filepool']);
                        for (let i = 0; i < tree['subtrees'].length; i++) {
                            disolute_subtree(tree, filepool_cleaning_bool, del_filepool_id_collection);
                        }
                    }
                }
                //filepool_cleanning == false means all we have to do is manage the template JSON (file_tree JSON)
            }

            function _delete_subtree(tree, display, filepool_cleaning_bool, del_filepool_id_collection) {
                for (let i = 0; i < tree['subtrees'].length; i++) {
                    if (tree['subtrees'][i]['display'] === display) {
                        //splice(i, j) : starting at the index i delete j items
                        _disolute_subtree(tree['subtrees'][i], filepool_cleaning_bool)
                        tree['subtrees'].splice(i, 1);
                        break;
                    }
                }
            }
            _delete_node(this.convert_path_to_tree(path), display, true, del_filepool_id_collection);
            return 'subtree deleted!'
        }
        return 'The Types of arguments are different than the pathHandler.template settings'
    }
    utilis_update_subtree(path=null, display, new_display, new_filepool, new_subtrees) {
        if (typeof(display) == this.node_template['display'] && typeof(filepool) == this.node_template['display']) {
            {
                function _update_subtree(tree, display, new_display, filepool, subtrees) {
                    for (let i = 0; i < tree['subtrees'].length - 1; i++) {
                        if (tree['subtrees'][i]['display'] === display) {
                            tree['subtrees'][i]['display'] = new_display;
                            tree['subtrees'][i]['filepool'] = new_filepool;
                            tree['subtrees'][i]['subtrees'] = new_subtrees;
                            break;
                        }
                    }
                }
                _update_subtree(this.convert_path_to_tree(path), display, new_display, new_filepool, new_subtrees)
            }
        }
    }

    display_tree(path=null) {
        //UT Done
        const display_data = {
            dirs: [], //{'dir1','dir2'...}
            files: [] //{{id:...}(JSON returned by API *Promise) }
        }
        const tree = this.convert_path_to_tree();
        display_data.files = this.api.get_files_by_filepool(tree["filepool"]);
        for (let i = 0; i < tree['subtrees'].length; i++) {
            display_data.dirs.push(tree['subtrees'][i]['display']);
        }
        return display_data;
    }
}
// let t = new PathHandler({"display":"Root","filepool":1,"subtrees":[{"display":"dir1","filepool":1,"subtrees":[{"display":"subdir1","filepool":3,"subtrees":[]}]},{"display":"dir2","filepool":2,"subtrees":[]}]},new APIHandler());

// console.log(t.display_tree())

class UserInterfaceHandler {
    constructor(init_tree,api){
        this.api = api
        this.path = new PathHandler(init_tree,this.api);
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
                    <img src="${pdf_image_url}" class="card-image-center">
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
            folders_container:document.querySelector('#folders_container'),
            files_container:document.querySelector('#folders_container'),
        };
        this.create_layout();
    }
    manage_breadcrumbs(){
        //clean
        this.parents.breadcrumbs.innerHTML ='';
        //add
        const path_list = resolve_path(this.path.current_path);
        for (let i =0 ; i<path_list.length ; i++){
            this.parents.breadcrumbs.innerHTML += this.template.breadcrumb(path_list[i]);
            this.parents.breadcrumbs.lastChild.addEventListener('click',(event)=>{
                event.preventDefault();
                this.path.update_current_path(assemble_path(path_list,0,i));
                this.create_layout();
            })
        }
    }

    manage_folders(){
        //clean
        this.parents.folders.innerHTML='';
        //add
        let folders_list = this.path.display_tree().dirs;

        function scope_handler(self,folder){
            self.parents.folders.innerHTML += self.template.folder(folder);
            self.parents.folders.lastChild.addEventListener('dblclick',()=>{
            self.path.update_current_path(`${self.path.current_path}${folder}/`);
            self.create_layout()});
        }
        folders_list.forEach((folder)=>{
            scope_handler(this,folder);
        })
    }
    manage_files(){
        //clean
        this.parents.files.innerHTML = '';
        //add
        let files_list_promise = this.path.display_tree().files;
        files_list_promise.then((files_list)=>{
            for (let i =0 ; i<files_list.length ; i++){
                const elt = document.createElement('div');
                elt.innerHTML = this.template.file(files_list[i].display_name , files_list[i].file_path);
                this.parents.files.appendChild(elt);
            }
        })
        
    }
    create_layout() {
        //step1: get current tree and parse it
        //step2: parse the curent path and update the breadcrumbs
        //step3: * create folders and files (using user_template object)
        //       * connect folders to events (using the Pathhandler Object) 
        this.manage_breadcrumbs();
        this.manage_folders();
        this.manage_files();
        //TODO: Hide if there's nothing there*
        //TODO: Fix the problem with the event listeners
        // if (this.parents.files_container.querySelector('div[data="file"]')==null){
        //     this.parents.files_container.className = 'hidden';
        // };
        // if (this.parents.folders_container.querySelector('div[data="folder"]')==null){
        //     this.parents.folders_container.className = 'hidden';
        // };
    }
}

class AdminInterfaceHandler{create_layout(){return true}}

class InterfaceHandler{
    constructor(client,is_staff){
        this.api = new APIHandler()
        this.target_client = is_staff?client:0;
        this.is_staff = is_staff==='True'?true:false;
        this.update_UI();
    }
    async update_UI(){
        if (this.is_staff){
            // get selected client
            // load it's tree
            // create AdminInterfaceHandler instance
        }
        else{
            //only init's the UserInterfaceHandler with some fetched data so it doesn't need to be fully async!
            const init_tree = await this.api.get_client(this.target_client).then((res)=>res.file_tree);
            const handler = await new UserInterfaceHandler(init_tree , this.api);
        }
    }
}
