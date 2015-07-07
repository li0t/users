/* jshint node: true */
'use strict';

module.exports = {

  debug: 'app:auth',

  authorizer: function (req) {
    if (req.session.user && req.session.workplace) {
      return 'user workplace';
    } else if (req.session.user) {
      return 'user';
    }

    return null;
  },

  paths: [ /** TODO: define */
    /*{
      method: 'DELETE',
      route: '*',
      allows: 'admin'
    },*/
    {
      method: ['GET', 'POST', 'PUT'],
      route: '/api/workplaces*',
      allows: ['user', 'user workplace']
    },
    {
      method: ['GET', 'POST', 'PUT'],
      route: [
        '/api/answers*', '/api/attachments*', '/api/comments*',
        /*'/api/files*',*/ '/api/patients*', '/api/sics*'
      ],
      allows: 'user workplace'
    },
    {
      method: ['GET', 'POST', 'PUT', 'DELETE'],
      route: '/api/contacts*',
      allows: ['user']
    }
  ]

};
