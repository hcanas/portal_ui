import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index.js';
import store from './store/index.js';
import VCalendar from 'v-calendar';
import VueAxios from 'vue-axios';
import axios from 'axios';
import './style.css';
import * as Cookies from "js-cookie";

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.headers.common['Authorization'] = `Bearer ${Cookies.get('auth_token') ?? null}`;

createApp(App)
  .use(router)
  .use(store)
  .use(VCalendar, {})
  .use(VueAxios, axios)
  .mount('#app')
