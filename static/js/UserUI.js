//import utils
class UserInterfaceHandler {
    constructor(init_tree, api) {
        this.api = api
        this.path = new PathHandler(init_tree, this.api);
        this.template = {
            breadcrumb: (folder_name, i) => `<a href="#" class="breadcrumb" id="crumb_${i}">${folder_name}</a>`,

            folder: (folder_name, i) => `<div class="col s12 m4 l2" data="folder"">
            <div class="card  rounded button" style="display: flex" id="folder_${i}">
                <div><i class="material-icons" style="padding:15px;">folder</i></div>
                <div>
                    <p style="padding:2px;">${folder_name}</p>
                </div>
                </div>
            </div>`,

            file: (file_name,download_link,file_size,file_type,year) => `<div class="col s6 m3 l2" data="file">
            <div class="card">
                <div class="card-image" style="max-height: 100px;max-width: 100px;">
                    <img src="${get_img(file_type)}" class="card-image-center">
                </div>
                <div class="card-content">
                    <p>${file_name}</p>
                    <p>Size: ${file_size}</p>
                    <p>Year: ${year}</p>
                </div>
                <div class="card-action">
                    <a href="${download_link}" download>Download</a>
                </div>
                </div>
            </div>`,
        };
        this.parents = {
            breadcrumbs: document.querySelector('div[data="wrap_breadcrumbs"]'),
            folders: document.querySelector('div[data="wrap_folders"]'),
            files: document.querySelector('div[data="wrap_files"]'),
            folders_container: document.querySelector('#folders_container'),
            files_container: document.querySelector('#folders_container'),
        };
        this.create_layout();
    }
    manage_breadcrumbs() {
        //clean
        this.parents.breadcrumbs.innerHTML = '';
        this.parents.breadcrumbs.removeEventListeners('click');
        //add
        const path_list = resolve_path(this.path.current_path);
        for (let i = 0; i < path_list.length; i++) {
            this.parents.breadcrumbs.innerHTML += this.template.breadcrumb(path_list[i], i);
        }
        this.parents.breadcrumbs.addEventListener('click', (event) => {
            if (event.target !== event.currentTarget) {

                event.preventDefault();
                var clicked_item = event.target;
                let index = clicked_item.id.split('_')[1];
                if (index) {
                    this.path.update_current_path(assemble_path(path_list, 0, index));
                    this.create_layout();
                }
            }
        });


    }

    manage_folders() {
        //clean
        this.parents.folders.innerHTML = '';
        let isMobile = window.matchMedia("(max-width: 1061px)").matches;
        let click_type = isMobile?'click':'dblclick'
        this.parents.folders.removeEventListeners(click_type);
        //add
        let folders_list = this.path.display_tree().dirs;
        if (folders_list.length ==0)this.parents.folders.innerHTML = '<p>No directories</p>';

        folders_list.forEach((folder, i) => {
            this.parents.folders.innerHTML += this.template.folder(folder, i);
        })
        this.parents.folders.addEventListener(click_type, (event) => {
            if (event.target !== event.currentTarget || event.target.getAttribute('data') !== 'folder') {

                event.preventDefault();

                var clicked_item = event.target;
                if (clicked_item.localName === 'p' || clicked_item.localName === 'i') {
                    clicked_item = event.target.parentElement.parentElement
                }

                let index = clicked_item.id.split('_')[1];
                if (index) {
                    this.path.update_current_path(`${this.path.current_path}${folders_list[index]}/`);
                    this.create_layout();
                }
            }
        });


    }
    manage_files() {
        //clean
        this.parents.files.innerHTML = '';
        //add
        
        if (this.path.convert_path_to_tree()['filepool']){
            let files_list_promise = this.path.display_tree().files;
            files_list_promise.then((files_list) => {
                if (files_list.length==0) this.parents.files.innerHTML = '<p>No Files</p>';
                else{
                    for (let i = 0; i < files_list.length; i++) {
                        const elt = document.createElement('div');
                        elt.innerHTML = this.template.file(files_list[i].display_name, files_list[i].file_path,files_list[i].size,files_list[i].type,files_list[i].year);
                        this.parents.files.appendChild(elt);}
                }
            })
        }
        else this.parents.files.innerHTML = '<p>No Files</p>';
    }
    create_layout() {
        //step1: get current tree and parse it
        //step2: parse the curent path and update the breadcrumbs
        //step3: * create folders and files (using user_template object)
        //* connect folders to events (using the Pathhandler Object)
        //! trigger animation
        this.manage_breadcrumbs();
        this.manage_folders();
        this.manage_files();

        //TODO: Hide if there's nothing there*
        // if (this.parents.files_container.querySelector('div[data="file"]') == null) {
        //     this.parents.files_container.className = 'hidden';
        // };
        // if (this.parents.folders_container.querySelector('div[data="folder"]') == null) {
        //     this.parents.folders_container.className = 'hidden';
        // };
    }
}


class InterfaceHandler {
    constructor(client) {
        this.api = new APIHandler();
        this.target_client = client;
        this.update_UI();
    }
    async update_UI() {
        //only init's the UserInterfaceHandler with some fetched data so it doesn't need to be fully async!
        const init_tree = await this.api.get_client(this.target_client).then((res) => res.file_tree);
        const handler = await new UserInterfaceHandler(init_tree, this.api);

    }
}