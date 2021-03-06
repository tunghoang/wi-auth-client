import {VIEWS} from '../../../constant';
import template from './user.html';
import toast from 'toastr';
import './user.css';

const name = VIEWS.user;

// ------------- HAM CHINH ---------------------------
//self.userPerPage is a string => have to parseInt before use

controller.$inject = ['user', 'search', 'company', 'auth', 'group'];

function controller(user, search, company, auth, group) {
    let self = this;
    self.currentUsername = window.localStorage.getItem("username");
    let users = []

    self.$onInit = function () {
        //console.log(toast);
        preProcess();
        init();


        //search type
        search.onSearchSubmit((text) => {
            self.searchStr = text

            updateNumPageFilter(u => u.username.includes(text))
        });
    }

    self.addUserSuccess = function (data) {
        // self.users.push(data);
        // // self.users = [...self.users];
        // //console.log(self.users);

        init();
        toast.success('Add user success');
    }

    self.editUserSuccess = function () {
        init();
        toast.success('Edit user success');
    }

    self.addGroupUserOnClick = function (user) {
        self.addGroupUser = user;
        self.addGroupUser_idCompany = user.idCompany;
    }

    self.editUserOnClick = function (user) {
        if (user.username === self.currentUsername) return toast.warning("You can not edit your infomation! Please contact supporter!");
        self.editUser = user;
    }

    self.removeUserOnClick = function (u) {

        const id = u.idUser;
        if (confirm('Are you sure to delete user : ' + u.username)) {
            user.deleteUser(id, (err, resp) => {
                if (err) {
                    //console.log(err);
                    self.errMsg = err.reason;
                    toast.error(err.reason);
                } else {
                    init();
                    toast.success('Delete success');
                }
            });
        }
    }

    self.changePage = function (page) {
        self.curPage = page;
    }

    self.changeUserPerPage = function () {
        // self.numPage = self.users.length / parseInt(self.userPerPage) + 1;
        self.numPage = calNumPage(self.users.length, self.userPerPage);
        if (self.curPage > self.numPage) self.curPage = 1;
        self.filterByCompany();
        self.filterByGroup();
    }

    self.activeUser = function (idUser) {
        const ACTIVE = 'Active';
        const data = {
            idUser,
            status: ACTIVE
        }

        user.changeStatus(data, (err, resp) => {
            if (err) {
                // self.errMsg = err.reason;
                toast.error(err.reason);
            } else {
                toast.success("User " + resp.content.username + " Actived");
                init();
            }
        })
    }

    self.deactiveUser = function (idUser) {
        const INACTIVE = 'Inactive';

        const data = {
            idUser,
            status: INACTIVE
        };

        user.changeStatus(data, (err, resp) => {
            if (err) {
                self.errMsg = err.reason;
            } else {
                toast.success("User " + resp.content.username + " Deactived");
                init();
            }
        })
    }

    self.forceUserLogOut = function (u) {
        if (confirm('Are you sure to End all session of : ' + u.username)) {
            user.forceLogOut(u.idUser, (err, resp) => {
                if (err) {
                    self.errMsg = err.reason;
                } else {
                    toast.success("Successful");
                    init();
                }
            });
        }
    };

    self.sort = function (sortBy) {
        if (self.sortBy = sortBy) self.reverse = !self.reverse;
        else self.reverse = false;


        self.sortBy = sortBy;
    }

    self.isActive = function (user) {
        const ACTIVE = 'Active';

        return user.status === ACTIVE;
    }

    self.getDefaultCompanyId = function (username) {
        const i = self.users.findIndex(u => u.username === username);
        // //console.log(self.users[i])
        return self.users[i].idCompany;
    }

    self.filterByCompany = function () {
        console.log({'self.inCompany.idCompany': self.inCompany.idCompany})
        updateNumPageFilter(user =>
            !self.inCompany.idCompany ||
            user.idCompany.toString() === self.inCompany.idCompany.toString())
    }

    self.filterByGroup = function () {
        if (!self.inGroup) {
            self.users = users
            updateNumPageFilter(user => !self.inCompany.idCompany ||
                user.idCompany.toString() === self.inCompany.idCompany.toString()) //all user
        } else {
            try {
                const _groups = JSON.parse(self.inGroup)
                updateNumPageFilter(user => !!(_groups.users.filter(_u => user.idUser === _u.idUser)[0]))
            } catch (e) {
                self.users = users
                updateNumPageFilter(u => true) //all user
            }
        }
    }

    self.getGroupFilterOptions = function () {
        const {idCompany} = self.inCompany;
        console.log({idCompany})
        if (!idCompany) return self.groups;
        else return self.groups.filter(g => g.idCompany.toString() === idCompany.toString())
    }


    function preProcess() {
        self.removeUser = [];
        self.addGroupUser = {};
        self.addGroupUser_idCompany = -1;
        self.userRole = auth.getData().role;


        //pre
        self.users = [];
        self.idToCompanyDict = {};
        self.reverse = false;
        self.companies = []
        self.groups = []

        //pagination
        self.userPerPage = 5;
        self.curPage = 1;
        // self.numPage = self.users.length / self.userPerPage + 1;
        self.numPage = calNumPage(self.users.length, self.userPerPage);

        //filter
        // self.searchStr = {};
        self.searchStr = ''
        self.sortBy = '';
        self.inCompany = {
            // idGroup: '',
            idCompany: ''
        }
        self.inGroup = ''  //json string that parse in filter
    }

    function init() {
        user.getAllUser((err, resp) => {

            if (err) {
                //console.log(err);
                self.errMsg = err.reason;
            } else {

                //console.log(resp);
                self.users = resp.content;
                users = resp.content;
                self.filter = '';
                console.log({'self.users': self.users})

                //pagination
                self.numPage = self.users.length / self.userPerPage + 1;
            }
        })


        company.getAllCompanies((err, resp) => {
            if (err) {
                //console.log(err);
                self.errMsg = err.reason;
            } else {

                const companies = resp.content;
                self.companies = companies;
                console.log({'self.companies': self.companies})
                companies.forEach(c => self.idToCompanyDict[c.idCompany] = c.name)
            }
        })

        group.getAllGroup((err, resp) => {
            if (err) {
                //console.log(err);
                self.errMsg = err.reason;
            } else {
                //console.log(resp);
                self.groups = resp.content;
                console.log({'self.groups': self.groups})
                // self.inGroup = self.groups[0]
            }
        })

    }

    function calNumPage(numElments, elPerPage) {
        // return self.users.length / parseInt(self.userPerPage) + 1;
        return parseInt(numElments) / parseInt(elPerPage) + 1;
    }

    function updateNumPageFilter(predicate) {
        //change page to one
        self.changePage(1);

        //update numPage            
        console.log('RUN');
        const numElment = self.users.filter(predicate).length;
        self.numPage = calNumPage(numElment, self.userPerPage);
        // console.log({numElment})
        // console.log('numpage: ', self.numPage)
    }

}


export default {
    name,
    options: {
        template,
        controller,
        controllerAs: 'self'
    }
};