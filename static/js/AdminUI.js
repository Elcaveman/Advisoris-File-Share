function utils_purge(data){
    let new_data = {};
    new_data['id']=data['id'];
    new_data['display_name']=data['display_name'];
    new_data['file_path']=data['file_path'];
    new_data['filepool']=data['filepool'];
    new_data['year']=data['year'];
    return JSON.stringify(new_data);
}
class AdminInterfaceHandler {
    constructor(init_tree, target_client, api) {
        this.api = api
        this.path = new PathHandler(init_tree, this.api);
        this.target_client = target_client;
        this.selected_item = null;
        this.template = {
            folder: (folder_name, i) => `<tr id="${folder_name}" type="folder">
            <td>
                <i class="fa fa-folder"></i>
                <span>${folder_name}</span>
            </td>
            <td>
                Folder
            </td>
            <td>
                _
            </td>
            <td>
                _
            </td>
        </tr>`,

            file: (data, i) => `<tr id="${data['id']}" type="file" data =${utils_purge(data)}>
            <td>
                ${get_img(data['type'])}
                <span>${data['display_name']}</span>
            </td>
            <td>
                ${data['type']}
            </td>
            <td>
                ${data['size']}
            </td>
            <td>
                ${data['year']}
            </td>
        </tr>`,
        };
        this.forms = {
            FileForm:document.querySelector('#file_form'),
            FolderForm:document.querySelector('#folder_form')
        }
        this.parents = {
            client:document.querySelector('#wraps-client'),
            navigation: document.querySelector('#wrap-navigation'),//contains the path handler, [prev,post] buttons
            actionButtons:document.querySelector('#wrap-actionButtons'),//contains the buttons used to interact with the UI/API
            forms:document.querySelector('#wrap-forms'),//contains the forms displayed on button click to Create/Update an elt
            table:document.querySelector('#FS'),
            table_wrapper:document.querySelector('#wrap-table'),
        };
        this.actionButtons={
            add_file: this.parents.actionButtons.querySelector('#add_file'),
            add_folder: this.parents.actionButtons.querySelector('#add_dir'),
            delete_element: this.parents.actionButtons.querySelector('#delete'),
            edit_element: this.parents.actionButtons.querySelector('#edit'),
        }
        //init's
        this.init_navigation();
        this.init_actionButtons();
        this.create_layout();
    }
    init_navigation(){
        let path_input = this.parents.navigation.querySelector('input');
        let path_validate = this.parents.navigation.querySelector('#validate_path');

        // let post_button= this.parents.navigation.querySelector('#post');
        let prev_button=this.parents.navigation.querySelector('#prev');
        
        path_input.value = this.path.current_path;
        
        path_validate.addEventListener('click',(event)=> {
            const vpath = path_input.value
            const response = this.path.utils_validate_path(vpath);
            if (response){
                if (this.path.convert_path_to_tree(vpath)===null){
                    path_input.value = this.path.current_path;
                    M.toast({html:"This path doesn't exist",classes:'red rounded' , displatLength:2000})
                }
                else{
                    this.path.update_current_path(vpath);
                    this.create_layout();
                }
            }
            else{
                path_input.value = this.path.current_path;
                M.toast({html:"Invalid path",classes:'red rounded' , displatLength:2000})
            }
        })
        prev_button.addEventListener('click',(event)=>{
            const list = resolve_path(this.path.current_path);
            let vpath;
            let response = false;
            if (list.length>1){
                list.pop();
                vpath = assemble_path(list,0,list.length);
                response = this.path.utils_validate_path(vpath);
            }
            else{
                return false;//desactivate click when path = root
            }
            if (response){
                if (this.path.convert_path_to_tree(vpath)===null){
                    M.toast({html:"This path doesn't exist",classes:'red rounded' , displatLength:2000})
                }
                else{
                    this.path.update_current_path(vpath);
                    this.create_layout();
                }
            }
            else{
                M.toast({html:"Invalid path",classes:'red rounded' , displatLength:2000})
            }
        })
    }
    clean_table(){
        this.parents.table.removeEventListeners('click');
        this.parents.table.removeEventListeners('dblclick');
        this.parents.table.innerHTML = '';
    }

    manage_files(){
        if (this.path.convert_path_to_tree()['filepool']!==0 && this.path.display_tree().files){
            let files_list_promise = this.path.display_tree().files;
            files_list_promise.then((files_list) => {
                for (let i = 0; i < files_list.length; i++) {
                    this.parents.table.innerHTML += this.template.file(files_list[i],i);
            }
        })
        }  
    }
    manage_dirs(){
        let folders_list = this.path.display_tree().dirs;
        folders_list.forEach((folder, i) => {
            this.parents.table.innerHTML += this.template.folder(folder, i);
        })
    }

    manage_table_events(){
        //dblclicks
        this.parents.table.addEventListener('dblclick', (event) => {
            if (event.target !== event.currentTarget) {
                event.preventDefault();
                let clicked_item = event.target;
                if (clicked_item.localName === 'td') {
                    clicked_item = clicked_item.parentElement
                }
                if (clicked_item.localName === 'span' ||clicked_item.localName === 'i') {
                    clicked_item = clicked_item.parentElement.parentElement
                }
                let type = clicked_item.getAttribute('type');
                if (type==='folder'){
                    this.path.update_current_path(`${this.path.current_path}${clicked_item.getAttribute('id')}/`);
                    this.create_layout();
                }
                if (type==='file'){
                    console.log('open file');
                }
            }
        });
        this.parents.table.addEventListener('click',(event)=>{
            if (event.target !== event.currentTarget) {
                event.preventDefault();
                let clicked_item = event.target;
                if (clicked_item.localName === 'td') {
                    clicked_item = clicked_item.parentElement
                }
                if (clicked_item.localName === 'span' ||clicked_item.localName === 'i') {
                    clicked_item = clicked_item.parentElement.parentElement
                }
                this.selected_item = clicked_item;
            }
        })
    }
    manage_navigation(){
        let path_input = this.parents.navigation.querySelector('input');
        path_input.value = this.path.current_path;
    }
    init_actionButtons() {
        this.actionButtons.add_file.addEventListener('click',(event)=>{
            let self = this;
            function handler(data){
                try {
                    const filepool = self.path.convert_path_to_tree()['filepool'];
                    if (filepool === 0){
                        try {
                            const pool = self.api.create_filepool(self.target_client,self.path.current_path).then((res)=>res.json());
                            try {
                                pool.then((json)=>{
                                    data.append('filepool',parseInt(json['id'],10));
                                    self.api.create_file(data);
                                    self.path.convert_path_to_tree().filepool = json['id'];
                                    self.api.update_file_tree(JSON.stringify(self.path.tree_copy) ,self.target_client);
                                    self.create_layout();
                                    return true
                                })
                            }
                            catch (error) {
                                M.toast({html:error,classes:'red rounded' , displatLength:2000});
                                self.api.delete_filepool(id);
                                return false;
                            }
                        } catch (error) {
                            M.toast({html:error,classes:'red rounded' , displatLength:2000});
                            return false;
                        }
                    }
                    else{
                        try {
                            data.append('filepool',parseInt(filepool,10));
                            self.api.create_file(data);
                            self.create_layout();
                            return true;
                        } catch (error) {
                            M.toast({html:error,classes:'red rounded' , displatLength:2000});
                            return 0;}
                    }
                } catch (error) {
                    M.toast({html:error,classes:'red rounded' , displatLength:2000});
                    return false;
                }
            }
            async function f(event){
                event.preventDefault();
                let data = new FormData();
                let display_name;
                //handles duplicate display name!
                const file_list = await self.path.display_tree().files
                if (file_list){
                        display_name= resolve_name(self.forms.FileForm.querySelector('#file_name').value,file_list,'display_name');
                    }
                else{
                        display_name= self.forms.FileForm.querySelector('#file_name').value
                    }
                
                
                data.append('display_name',display_name);
                data.append('file_path',self.forms.FileForm.querySelector('#file_path').files[0]);
                data.append('year',self.forms.FileForm.querySelector('#year').value);

                if (handler(data)){
                    M.toast({html:'File created successfully!',classes:'green rounded' , displatLength:2000});
                }
                else{
                    M.toast({html:'Try again',classes:'gray rounded' , displatLength:2000});
                }
                self.parents.forms.querySelector('#file_form').classList.add('hidden');
                submit_file.removeEventListeners('click');
            }

            this.parents.forms.querySelector('#file_form').classList.remove('hidden');
            let submit_file = this.forms.FileForm.querySelector('#save_file');
            submit_file.addEventListener('click',f)
        });

        this.actionButtons.add_folder.addEventListener('click',(event)=>{
            let self = this;
            function handler(data){
                try {
                    self.path.utils_create_subtree(null,data['folder_name'],0);
                    //REMOVE JSON.STRINGIFY ONCE ON PRODUCTION (postgres has a JSONfield)
                    self.api.update_file_tree(JSON.stringify(self.path.tree_copy),self.target_client);
                    self.create_layout();
                    return true;
                } catch (error) {
                    M.toast({html:error,classes:'red rounded' , displatLength:2000});
                    return false
                }
            }
            this.parents.forms.querySelector('#folder_form').classList.remove('hidden');
            let submit_folder = this.forms.FolderForm.querySelector('#save_folder');
            submit_folder.addEventListener(('click'),(event)=>{
                event.preventDefault();
                const data = {
                    folder_name:this.forms.FolderForm.querySelector('#folder_name').value,
                }
                if (handler(data)){
                    M.toast({html:'Folder created successfully!',classes:'green rounded' , displatLength:2000});
                }
                else{
                    M.toast({html:'Try again',classes:'gray rounded' , displatLength:2000});
                }
                this.parents.forms.querySelector('#folder_form').classList.add('hidden');
                submit_folder.removeEventListeners('click');
            })

        });

        this.actionButtons.delete_element.addEventListener('click',(event)=>{
            if (this.selected_item){
                
                let element_id = this.selected_item.getAttribute('id');
                let element_type = this.selected_item.getAttribute('type');
                if (element_type ==='folder'){
                    this.path.utils_delete_subtree(null,element_id);
                    this.api.update_file_tree(JSON.stringify(this.path.tree_copy),this.target_client)
                    .then(r=>this.create_layout());
                }
                if (element_type === 'file'){
                    //let element_data = JSON.parse(this.selected_item.getAttribute('data'));
                    let self = this;
                    this.api.delete_file(element_id)
                    .then(()=>{
                        this.path.display_tree().files.then(resp=>{
                            if (resp.length ===0)return true;
                            else return false;
                        }).then(bool=>{
                            if(bool){
                                this.api.delete_filepool(this.path.convert_path_to_tree()['filepool'])
                                .then(()=>{
                                    this.path.convert_path_to_tree()['filepool'] = 0;
                                    this.api.update_file_tree(JSON.stringify(this.path.tree_copy),this.target_client)
                                    .then((r)=>{
                                        //console.log(r);
                                        this.create_layout()});
                                })
                            }
                            else{
                                this.create_layout();
                            }
                        })
                    })    
                }
            }
            else{
                M.toast({html:'Select a file or a folder',classes:'red rounded' , displatLength:2000})
            }
        });

        this.actionButtons.edit_element.addEventListener('click',(event)=>{
            if (this.selected_item){
                let self = this;
                function handle_file(element_id,data){
                    try {
                        self.api.update_file(element_id,data.file_path,data.file_name , data.filepool , data.year);
                        M.toast({html:'File updated succesfully!',classes:'green rounded' , displatLength:2000});
                        return true;
                    } catch (error) {
                        M.toast({html:error,classes:'red rounded' , displatLength:2000});
                        return false;
                    }
                    
                }

                function handle_folder(element_id,data){
                    self.path.utils_update_subtree(null,element_id,data.folder_name,null,null);
                    self.api.update_file_tree(JSON.stringify(self.path.tree_copy),self.target_client);
                }
                let element_id = this.selected_item.getAttribute('id');
                let element_data = this.selected_item.getAttribute('data');
                let element_type = this.selected_item.getAttribute('type');                
                
                if (element_type ==='folder'){
                    //show form
                    this.parents.forms.querySelector('#folder_form').classList.remove('hidden');
                    let submit_folder = this.forms.FolderForm.querySelector('#save_folder');
                    //populate form
                    this.forms.FolderForm.querySelector('#folder_name').value = element_data;
                    //listen to submit form
                    submit_folder.addEventListener(('click'),(event)=>{
                        event.preventDefault();
                        const data = {
                            folder_name:this.forms.FolderForm.querySelector('#folder_name').value,
                        }
                        if (handle_folder(data)){
                            M.toast({html:'Folder created successfully!',   classes:'green rounded' , displatLength:2000});
                        }
                        else{
                            M.toast({html:'Try again',classes:'gray rounded' ,  displatLength:2000});
                        }
                        //hide form
                        this.parents.forms.querySelector('#folder_form').classList.add('hidden');
                        submit_folder.removeEventListeners('click');
                    })
                
                }

                if (element_type == 'file'){

                    this.parents.forms.querySelector('#file_form').classList.remove('hidden');
                    let submit_file = this.forms.FolderForm.querySelector('#save_file');
                    
                    this.forms.FileForm.querySelector('#file_name').value = element_data['display_name'];

                    this.forms.FileForm.querySelector('#current_file').setAttribute('href',element_data['file_path']);
                    this.forms.FileForm.querySelector('#current_file').inenerText = element_data['file_path'].split('/').pop();

                    this.forms.FileForm.querySelector('#year').value = element_data['year'];


                    submit_file.addEventListener(('click'),(event)=>{
                        event.preventDefault();
                        const data = {
                            file_name:this.forms.FileForm.querySelector('#file_name').value,
                            filepool:element_data['filepool'],
                            year:this.forms.FileForm.querySelector('#year').value,
                        }
                        if (this.forms.FileForm.querySelector('#file_path').files[0]){
                            data.file_path = this.forms.FileForm.querySelector('#file_path').files[0];
                        }
                        else{
                            //fetch file from url and add it to the data object
                            fetch(element_data['file_path']).then(res => data.file_path = res.blob());
                        }
                        
                        if (handle_file(data)){
                            M.toast({html:'File created successfully!',   classes:'green rounded' , displatLength:2000});
                        }
                        else{
                            M.toast({html:'Try again',classes:'gray rounded' ,  displatLength:2000});
                        }
                        this.parents.forms.querySelector('#file_form').classList.add('hidden');
                        submit_folder.removeEventListeners('click');
                    })
                }
            }
            else{
                M.toast({html:'Select a fiel or a folder',classes:'red rounded' , displatLength:2000})
            }
        });
        //add click handler for the whole div to know if another button was clicked!

    }

    create_layout() {
        this.clean_table();
        this.manage_navigation();
        this.manage_files();
        this.manage_dirs();
        this.manage_table_events();
    }
}

class InterfaceHandler {
    constructor() {
        this.client_choice = document.querySelector('#client-choice');
        this.template = {
            options:(client_id,client_name,data) =>`<option value="${client_id}" data='${data}'>${client_name}</option>`,
        };
        this.api = new APIHandler();
        this.target_client = 0;
        this.Client_Loader();
        this.Client_Listener();
        this.LoadUIHandler();
    }
    Client_Loader(){
        let self = this;
        this.api.get_client().then((client_list)=>{
            //load options
            for (let i =0;i<client_list.length;i++){
                self.client_choice.innerHTML += self.template.options(client_list[i]['id'] , client_list[i]['client_name'],client_list[i]);
            }
        });
    }
    Client_Listener(){
        let self = this;
        this.client_choice.addEventListener('change',(event)=>{
            self.target_client = event.target.value;
            self.LoadUIHandler();
        })
    }
    async LoadUIHandler(){
        if (this.target_client!=0){
            const init_tree = await this.api.get_client(this.target_client).then((res) => res.file_tree);
            const handler = await new AdminInterfaceHandler(init_tree,this.target_client,this.api);
        }
        
    }
}

let t = new InterfaceHandler();