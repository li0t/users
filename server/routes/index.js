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
    '/users', '/users/:id/profile', '/users/signup', '/users/signin', '/users/recover', '/users/validate/:token', '/users/reset/:token',
    '/users/invited/validate/:token',

    /* Groups */
    '/groups', '/groups/create', '/groups/:id/profile',

    /* Groups Members */
    '/groups/:id/members', '/groups/:id/members/add', '/groups/:id/members/remove',

    /* Groups Entries */
    '/groups/:id/entries', '/groups/:id/entries/create', '/groups/:id/entries/:entry/detail',
    '/groups/:id/entries/notes', '/groups/:id/entries/notes/create', '/groups/:id/entries/notes/:note/detail',
    '/groups/:id/entries/documents', '/groups/:id/entries/documents/create', '/groups/:id/entries/documents/:document/detail',

    /* Groups Tasks */
    '/groups/:id/tasks', '/groups/:id/tasks/:task/detail', '/groups/:id/tasks/:task/collaborators',
    '/groups/:id/tasks/:task/collaborators/add', '/groups/:id/tasks/create',

    /* Entries */
    '/entries', '/entries/create', '/entries/remove', '/entries/:id/detail',

    /* Tasks */
    '/tasks', '/tasks/collaborator', '/tasks/own', '/tasks/create', '/tasks/remove', '/tasks/:id/detail',

    /* Contacts */
    '/contacts', '/contacts/add/:id', '/contacts/remove/:id',

    /* Meetings */
    '/meetings',

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
