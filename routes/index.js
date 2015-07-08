/* jshint node: true */
'use strict';

module.exports = function(router) {

  /**
   * Provide any route that doesn't matches /api/* or /templates/* with the default view.
   *
   * You must configure the rest of the public routes in Angular. User /api/* for CRUD operations and /templates/* for the views.
   */
  router.get([

    '/', '/welcome', '/profile',

    /* Users */
    '/users', '/users/:id/profile', '/users/signup', '/users/signin', '/users/recover', '/users/reset/:token',

    /* Groups */
    '/groups', '/groups/create', '/groups/:id/profile',
    '/groups/:id/members', '/groups/:id/members/add', '/groups/:id/members/remove',
    '/groups/:id/entries', '/groups/:id/entries/add', '/groups/:id/entries/:entry/detail',  '/groups/:id/entries/remove/:entry',
    '/groups/:id/tasks', '/groups/:id/tasks/:task/detail',
    '/groups/:id/tasks/add', '/groups/:id/tasks/remove/:task',

    /* Entries */
    '/entries', '/entries/add', '/entries/remove', '/entries/:id/detail',

    /* Tasks */
    '/tasks', '/tasks/create', '/tasks/remove', '/tasks/:id/detail',

    /* Contacts */
    '/contacts', '/contacts/add/:id', '/contacts/remove/:id',

  ], function(req, res) {

    /* Set the XSRF token cookie on first request */
    res.cookie('XSRF-TOKEN', res.locals._csrf); /* The _csrf is set by lusca */

    /* Render the default public layout */
    res.render('index', {
      title: "emeeter"
    });

  });

};
