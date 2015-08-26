'use strict';

module.exports = function(router) {

  /**
   * Provide any route that doesn't matches /api/* or /templates/* with the default view.
   *
   * You must configure the rest of the public routes in Angular. User /api/* for CRUD operations and /templates/* for the views.
   */
  router.get([

    /* Pages */
    '/', '/search',

    /* Users */
    '/users',
    '/users/signin',
    '/users/signup',
    '/users/recover',
    '/users/:id/profile',
    '/users/reset/:token',
    '/users/validate/:token',
    '/users/invited/validate/:token',

    /* Groups */
    '/groups',
    '/groups/create',
    '/groups/:id/profile',

    /* Groups Members */
    '/groups/:id/members',
    '/groups/:id/members/add',
    '/groups/:id/members/remove',

    /* Groups Entries */
    '/groups/:id/entries',
    '/groups/:id/entries/:type',
    '/groups/:id/entries/create/note',
    '/groups/:id/entries/create/image',
    '/groups/:id/entries/create/audio',
    '/groups/:id/entries/create/document',
    '/groups/:id/entries/:entry/detail',

    /* Groups Tasks */
    '/groups/:id/tasks',
    '/groups/:id/tasks/create',
    '/groups/:id/tasks/:task/detail',
    '/groups/:id/tasks/:task/collaborators',
    '/groups/:id/tasks/:task/collaborators/add',

    /* Groups Meetings */
    '/groups/:id/meetings',
    '/groups/:id/meetings/create',
    '/groups/:id/meetings/:meeting/detail',
    '/groups/:id/meetings/:meeting/attendants',
    '/groups/:id/meetings/:meeting/attendants/add',

    /* Entries */
    '/entries',
    '/entries/:type',
    '/entries/:id/detail',
    '/entries/create/note',
    '/entries/create/image',
    '/entries/create/document',

    /* Tasks */
    '/tasks',
    '/tasks/create',
    '/tasks/creator',
    '/tasks/:id/detail',
    '/tasks/collaborator',

    /* Contacts */
    '/contacts',
    '/contacts/add/:id',
    '/contacts/remove/:id',

    /* Meetings */
    '/meetings',
    '/meetings/create',
    '/meetings/creator',
    '/meetings/attendant',
    '/meetings/:id/detail',

    /* Tags */
    '/tags',
    '/tags/create',

    /* Settings */
    '/settings',

    /* Analitycs */
    '/analitycs',

  ], function(req, res) {

    /* Set the XSRF token cookie on first request */
    res.cookie('XSRF-TOKEN', res.locals._csrf); /* The _csrf is set by lusca */

    /* Render the default public layout */
    res.render('index', {
      title: "emeeter"
    });

  });

};
