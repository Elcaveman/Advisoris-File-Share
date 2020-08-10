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

            file: (data, i) => `<tr id="${data['id']}" type="file" data ="${data}">
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
            FileForm:document.querySelector('#file-form'),
            FolderForm:document.querySelector('#folder-form')
        }
        this.parents = {
            client:document.querySelector('#wraps-client'),
            navigation: document.querySelector('#wrap-navigation'),//contains the path handler, [prev,post] buttons
            actionButtons:document.querySelector('#wrap-actionButtons'),//contains the buttons used to interact with the UI/API
            forms:document.querySelector('#wrap-forms'),//contains the forms displayed on button click to Create/Update an elt
            table:document.querySelector('#wrap-table'),
        };
        this.actionButtons={
            add_file: this.parents.actionButtons.querySelector('#add_file'),
            add_folder: this.parents.actionButtons.querySelector('#add_dir'),
            delete_element: this.parents.actionButtons.querySelector('#delete'),
            edit_element: this.parents.actionButtons.querySelector('#edit'),
        }
        //init's
        this.init_navigation();
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
        prev_button.addEventListener('click',(event)=>{
            const list = resolve_path(this.path.current_path);
            list.pop();
            const vpath = assemble_path(list);
            const response = this.path.utils_validate_path(vpath);
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
    init_form(){
        //* init form on actionbutton click!
        // let submit_file = this.forms.FileForm.querySelector('button');
        // let submit_folder = this.forms.FolderForm.querySelector('button');
        // submit_file.addEventListener('click',(event)=>{

        // })

        // submit_folder.addEventListener('click',(event)=>{

        // })
    }
    destroy_form(){

    }
    init_actionButtons() {
        //ads and event lsitener to the table
        this.actionButtons.add_file.addEventListener('click',(event)=>{
            let self = this;
            function handler(data){
                try {
                    const filepool = self.path.convert_path_to_tree().filepool;
                    const created_filepool = false;
                    if (filepool == 0){
                        try {
                            const id = self.api.create_filepool(data['owner'],data['path']).then((res)=>res.id);
                            try {
                                self.api.create_file(data['file_name'],data['file_content'],id,data['year']);
                                self.path.convert_path_to_tree().filepool = id;
                                self.api.update_file_tree(self.path.tree_copy ,this.target_client);
                                //!REload
                                }
                            catch (error) {
                                M.toast({html:error,classes:'red rounded' , displatLength:2000});
                                self.api.delete_filepool(id);
                                return 0;
                            }
                        } catch (error) {
                            M.toast({html:error,classes:'red rounded' , displatLength:2000});
                            return 0;
                        }
                    }
                    else{
                        try {
                            self.api.create_file((data['file_name'],data['file_content'],filepool,data['year']));
                            //!REload
                        } catch (error) {
                            M.toast({html:error,classes:'red rounded' , displatLength:2000});
                            return 0;}
                    }
                } catch (error) {
                    M.toast({html:error,classes:'red rounded' , displatLength:2000})
                }
            }
            this.parents.forms.querySelector('#file_form').classList.remove('hidden');
            let submit_file = this.forms.FileForm.querySelector('button');
            submit_file.addEventListener(('click'),(event)=>{
                data = {
                    file_name:this.forms.FileForm.querySelector('#file_name').value,
                    file_content:this.forms.FileForm.querySelector('#file_content').files[0],//get the downloaded file from the input
                    year:this.forms.FileForm.querySelector('#year').value,
                }
                if (handler(data)){
                    M.toast({html:'File created successfully!',classes:'green rounded' , displatLength:2000});
                }
                else{
                    M.toast({html:'Try again',classes:'gray rounded' , displatLength:2000});
                }
                this.parents.forms.querySelectorAll('form').classList.add('hidden');
                submit_file.removeEventListeners('click');
            })
        });

        this.actionButtons.add_folder.addEventListener('click',(event)=>{
            let self = this;
            function handler(data){
                try {
                    this.path.utils_create_subtree(null,data['folder_name'],0);
                    this.api.update_file_tree(this.path.tree_copy,this.target_client);
                    //reload
                    return true;
                } catch (error) {
                    M.toast({html:error,classes:'red rounded' , displatLength:2000});
                    return false
                }
            }
            this.parents.forms.querySelector('#folder_form').classList.remove('hidden');
            let submit_folder = this.forms.FolderForm.querySelector('button');
            submit_folder.addEventListener(('click'),(event)=>{
                data = {
                    folder_name:this.forms.FolderForm.querySelector('#folder_name').value,
                }
                if (handler(data)){
                    M.toast({html:'Folder created successfully!',classes:'green rounded' , displatLength:2000});
                }
                else{
                    M.toast({html:'Try again',classes:'gray rounded' , displatLength:2000});
                }
                this.parents.forms.querySelectorAll('form').classList.add('hidden');
                submit_folder.removeEventListeners('click');
            })

        });

        this.actionButtons.delete_element.addEventListener('click',(event)=>{
            if (this.selected_item){
                let element_id = this.selected_item.getAttribute['id'];
                let element_data = this.selected_item.getAttribute['data']
                let element_type = this.selected_item.getAttribute['type'];

                if (element_type ==='folder'){
                    this.path.utils_delete_subtree(null,element_id);
                    this.api.update_file_tree(this.path.tree_copy,this.target_client);
                }
                if (element_type == 'file'){
                    this.api.delete_file(element_id);
                    this.api.clean_filepool(this.convert_path_to_tree()['filepool']).then((resp)=>{
                        if (resp){
                            this.convert_path_to_tree()['filepool'] = 0;
                            this.api.update_file_tree(this.path.tree_copy,this.target_client);
                        }
                    });
                }
            }
            else{
                M.toast({html:'Select a fiel or a folder',classes:'red rounded' , displatLength:2000})
            }
        });
        this.actionButtons.edit_element.addEventListener('click',(event)=>{
            if (this.selected_item){
            //     let element_id = this.selected_item.getAttribute['id'];
            //     let element_data = this.selected_item.getAttribute['data']
            //     let element_type = this.selected_item.getAttribute['type'];

            //     if (element_type ==='folder'){
            //         this.path.utils_update_subtree(null,element_id,);
            //         this.api.update_file_tree(this.path.tree_copy,this.target_client);
            //     }
            //     if (element_type == 'file'){
            //         this.api.delete_file(element_id);
            //         this.api.clean_filepool(this.convert_path_to_tree()['filepool']).then((resp)=>{
            //             if (resp){
            //                 this.convert_path_to_tree()['filepool'] = 0;
            //                 this.api.update_file_tree(this.path.tree_copy,this.target_client);
            //             }
            //         });
            //     }
                if (element_type ==='folder'){
                    //update filetree
                }
                if (element_type ==='file'){
                    //PUT file
                }
            }
            else{
                M.toast({html:'Select a fiel or a folder',classes:'red rounded' , displatLength:2000})
            }
        });

    }

    create_layout() {

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
            self.target_client = event.target.getAttribute('data');
            self.LoadUIHandler();
        })
    }
    async LoadUIHandler(){
        const init_tree = await this.api.get_client(this.target_client).then((res) => res.file_tree);
        const handler = await new AdminInterfaceHandler(init_tree,this.target_client,this.api);
    }
}