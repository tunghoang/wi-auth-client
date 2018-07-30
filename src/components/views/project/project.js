import {VIEWS} from '../../../constant';
import template from './project.html';
import toast from "toastr";
import './project.css';

const name = VIEWS.project;

controller.$inject = ['project', 'search']

function controller(project, search) {
    let self = this;

    self.$onInit = function () {
        preProcess();
        init();
        search.onSearchSubmit((text) => {
            self.searchStr = text;
            self.changePage(1);
            const numElments = self.projects.filter(c => c.name.includes(text) || c.createdBy.includes(text)).length;
            self.numPage = calNumPage(numElments, self.projectPerPage);
        });
    };

    self.sort = function (sortBy) {
        if (self.sortBy === sortBy) self.reverse = !self.reverse;
        else self.reverse = false;
        self.sortBy = sortBy;
    };

    function preProcess() {
        self.projects = [];
        self.projectPerPage = 10;
        self.curPage = 1;
        self.numPage = calNumPage(self.projects.length, self.projectPerPage);
        self.searchStr = {};
        self.errMsg = '';
        self.sortBy = '';
        self.reverse = false;
    }

    self.changeProjectPerPage = function () {
        self.numPage = calNumPage(self.projects.length, self.projectPerPage);
        if (self.curPage > self.numPage) self.curPage = 1;
    };
    self.changePage = function (page) {
        self.curPage = page;
    };

    function init() {
        project.getAllProject({}, (err, resp) => {
            if (err) {
                self.errMsg = err.reason;
                toast.error(err.reason);
            } else {
                self.errMsg = '';
                self.projects = resp.content;
                self.numPage = calNumPage(self.projects.length, self.projectPerPage);
            }
        });
    }

    self.removeProject = function (idProject, owner) {
        const data = {idProject, owner};
        if (confirm('Are you sure remove this project?')) {
            project.removeProject(data, (err, resp) => {
                if (err) {
                    self.errMsg = err.reason;
                    toast.error(err.reason);
                } else {
                    self.errMsg = '';
                    init();
                    toast.success('Delete success');
                }
            })
        }
    };

    function calNumPage(numElments, elPerPage) {
        return parseInt(numElments) / parseInt(elPerPage) + 1;
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