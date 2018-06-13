import { VIEWS } from '../../../constant';
import template from './company.html';

const name = VIEWS.company;

controller.$inject = ['company']
function controller(company) {

    let self = this;

    self.$onInit = function () {
        preProcess();
        init();
    }

    function preProcess() {
        self.companies = [];

        //pagination
        self.companyPerPage = 5;
        self.curPage = 1;
        self.numPage = self.companies.length / self.companyPerPage + 1;

        //filter
        self.searchStr = '';

        //text info
        self.errMsg = ''
    }

    function init() {
        company.getAllCompanies((err, resp) => {
            if(err) {
                console.log(err);
                self.errMsg = err.reason;
            } else {
                console.log(resp);
                self.companies = resp.content;
            }
        })
    }

}

// angular
//     .module(appName)
//     .component(name, {
//         template,
//         controller,
//         controllerAs: 'self'
//     })


export default {
    name,
    options: {
        template,
        controller,
        controllerAs: 'self'
    }
};