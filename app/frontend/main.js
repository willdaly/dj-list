import $ from 'jquery';
import _ from 'lodash';
import moment from 'moment';

window.$ = $;
window.jQuery = $;
window._ = _;
window.moment = moment;

import 'bootstrap/dist/css/bootstrap.css';
import 'nouislider/dist/nouislider.css';
import 'bootstrap/dist/js/bootstrap';

import { initApp } from './modules/app-ui';
import { initSockets } from './modules/sockets';

$(document).ready(() => {
  initApp();
  initSockets();
});
