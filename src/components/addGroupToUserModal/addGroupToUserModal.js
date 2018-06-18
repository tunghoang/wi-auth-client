import template from './addGroupToUserModal.html';

const name = 'addGroupToUserModal';

controller.$inject = ['group', 'modal'];
function controller(group, modal) {

    let self = this;

    self.$onInit = function () {
        
        preProcess();

        group.getAllGroup((err, resp) => {
            if(err) {
                self.errMsg = err.reason || err.statusText;
                self.sucMsg = '';
            } else {
                self.listGroup = resp.content;
                // console.log('list content');
                // console.log(resp.content);
            }
        })
        
    }

    self.onClose = function() {
        preProcess();
    }

    self.onSubmit = function() {
        const data = {
            idGroup: self.idGroup,
            idUser: self.userId
        };
        group.addUserToGroup(data, (err, resp) => {
            if(err) {
                console.log(err);
                self.errMsg = err.reason || err.statusText;
                self.sucMsg = '';
            } else {
                console.log(resp);
                self.sucMsg = resp.reason;
                self.errMsg = '';
                modal.closeModal(self.name);
            }
        })
    }

    self.onClose = function(){
        // preProcess();
        //prevent lost data (not neccessary to reload again)

        //because after click close and click add again
        //the component has been already init
        // => init func doesnt get call
        // => if call preProcess cause lose data

        self.sucMsg = '';
        self.errMsg = '';
    }

    function preProcess(){
        self.name = 'add-group-modal';

        self.sucMsg = '';
        self.errMsg = '';
        self.listGroup = [];
        self.idGroup = null ;
    }

}

// angular`
//     .module(appName)
//     .component(name, {
//         template
//     })

export default {
    name,
    options: {
        bindings: {
            userId: '<'
        },
        template,
        controller,
        controllerAs: 'self'
    }
};