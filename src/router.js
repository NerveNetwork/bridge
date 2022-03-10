import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import("@/views/home/index.vue")
    },
    {
      path: '/transfer',
      name: 'transfer',
      component: () => import("@/views/transfer/index.vue")
    },
    {
      path: '/accounts',
      name: 'accounts',
      component: () => import("@/views/accounts/index.vue")
    },
    {
      path: '/tx-list',
      name: 'txList',
      component: () => import("@/views/txList/index.vue")
    },
    {
      path: '/tx-detail',
      name: 'txDetail',
      component: () => import("@/views/txDetail/index.vue")
    },
    {
      path: '/test',
      name: 'test',
      component: () => import("@/views/test/index.vue")
    }
  ]
})
