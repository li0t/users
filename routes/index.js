/* jshint node: true */
'use strict';

module.exports = function(router) {

  /**
   * Provide any route that doesn't matches /api/* or /templates/* with the default view.
   *
   * You must configure the rest of the public routes in Angular. User /api/* for CRUD operations and /templates/* for the views.
   */
  router.get([

    '/', '/welcome',

    /* Users */
    '/users', '/users/:id/profile', '/users/signup', '/users/signin', '/users/recover', '/users/reset/:token',

    /* Groups */
    '/groups', '/groups/:id/profile',
    '/groups/:id/members', '/groups/:id/members/add', '/groups/:id/members/remove',
    '/groups/:id/entries', '/groups/:id/entries/add', '/groups/:id/entries/:entry/detail',  '/groups/:id/entries/remove/:entry',
    '/groups/:id/tasks', '/groups/:id/tasks/:task/detail',
    '/groups/:id/tasks/add', '/groups/:id/tasks/remove/:task',

    /* Entries */
    '/entries', '/entries/add', '/entries/remove',

    /* Tasks */
    '/tasks', '/tasks/add', '/tasks/remove',

    /* Contacts */
    '/contacts', '/contacts/add', '/contacts/remove',

  ], function(req, res) {

    /* Set the XSRF token cookie on first request */
    res.cookie('XSRF-TOKEN', res.locals._csrf); /* The _csrf is set by lusca */

    /* Render the default public layout */
    res.render('index', {
      title: "emeeter"
    });

  });

};
