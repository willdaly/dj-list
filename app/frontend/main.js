import 'bootstrap/dist/css/bootstrap.css';
import 'jquery-ui-dist/jquery-ui.css';
import 'nouislider/dist/nouislider.css';

import $ from 'jquery';
import _ from 'lodash';
import moment from 'moment';

window.$ = $;
window.jQuery = $;
window._ = _;
window.moment = moment;

import 'jquery-ui-dist/jquery-ui';
import 'bootstrap/dist/js/bootstrap';

import { initApp } from './modules/app-ui';
import { initSockets } from './modules/sockets';

$(document).ready(() => {
  initApp();
  initSockets();
});
