import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import store from '../store/index.js';
import * as Cookies from 'js-cookie';
import axios from 'axios';

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/time_attendance',
    name: 'time_attendance',
    component: () => import('../views/TimeAttendance.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/users',
    name: 'user.list',
    component: () => import('../views/Users.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/roles',
    name: 'role.list',
    component: () => import('../views/Roles.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/permissions',
    name: 'permission.list',
    component: () => import('../views/Permissions.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/offices',
    name: 'office.list',
    component: () => import('../views/Offices.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/items',
    name: 'item.list',
    component: () => import('../views/Items.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/item_categories',
    name: 'item_category.list',
    component: () => import('../views/ItemCategories.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from) => {
  if (to.meta.requiresAuth && Cookies.get('auth_token') === undefined) {
    store.commit('setUser', null);
    return '/login';
  } else if (to.meta.requiresAuth && Cookies.get('auth_token')) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${Cookies.get('auth_token')}`;
    const permissions = ['user_account', 'time_attendance'];

    axios.get(`${import.meta.env.VITE_API_URL}/api/auth/${Cookies.get('auth_token')}?permissions=${permissions.join(',')}`)
    .then(response => {
      store.commit('setUser', response.data);
    })
    .catch(error => {
      store.commit('setUser', null);
      window.location = `${import.meta.env.VITE_DOMAIN}/login`;
    });
  }
});

export default router;