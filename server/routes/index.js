'use strict';

module.exports = function(router) {

  /**
   * Provide any route that doesn't matches /api/* or /templates/* with the default view.
   *
   * You must configure the rest of the public routes in Angular. User /api/* for CRUD operations and /templates/* for the views.
   */
  router.get([

    /* Contacts */
    '/contacts',

    /* Settings */
    '/settings',

    /* Analitycs */
    '/analitycs',

    /* Pages */
    '/', '/search',

    /* Tags */
    '/tags',
    '/tags/create',

    /* Tokens */
    '/tokens/:secret',

    /* Tasks */
    '/tasks',
    '/tasks/create',
    '/tasks/creator',
    '/tasks/:id/detail',
    '/tasks/collaborator',

    /* Groups Members*/
    '/groups/:id/members',
    '/groups/:id/members/add',

    /* Meetings */
    '/meetings',
    '/meetings/create',
    '/meetings/creator',
    '/meetings/attendant',
    '/meetings/:id/detail',

    /* Entries */
    '/entries',
    '/entries/:type',
    '/entries/:id/detail',
    '/entries/create/note',
    '/entries/create/audio',
    '/entries/create/image',
    '/entries/create/document',

    /* Groups */
    '/groups',
    '/groups/:id/tasks',
    '/groups/:id/profile',
    '/groups/:id/meetings',
    '/groups/:id/entries/:type',

    /* Users */
    '/users',
    '/users/signin',
    '/users/signup',
    '/users/recover',
    '/users/:id/profile',
    '/users/reset/:token',
    '/users/validate/:secret',
    '/users/invited/validate/:secret'

  ], function(req, res) {

    /* Set the XSRF token cookie on first request */
    res.cookie('XSRF-TOKEN', res.locals._csrf); /* The _csrf is set by lusca */

    /* Render the default public layout */
    res.render('index', {
      title: "emeeter"
    });

  });

};
