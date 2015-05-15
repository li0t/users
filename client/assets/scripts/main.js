

/*global $ */
/*global document */
/*global FormData */

$(document).ready(function() {

  var contacts,
      groups,
      user,
      group,
      admin,
      members;

  function displayGroups() {

    var email, isMemeber, i, $this;

    $("input[type='radio'][name=group]").click(function() {

      $('#thisGroup').empty().append('<p>members</p>');

      $this = $(this);

      group = this.value;


      $.
      get('api/groups/' + group + '/members').

      done(function(data) {

        members = data;

        $('#thisGroup').append('<form id="thisGroupForm"></form>');

        data.forEach(function(member){

          email = member.email;

          if (member.email === user.email) {

            email += ' (me)';

          }

          if (member._id === admin[group]) {

            email += ' (admin)';

          } 

          $('#thisGroupForm').
          append('<input type="checkbox" name="members" value="' + member._id+ '"/>' + email + '<br>');

        });

        if (user._id === admin[group]) { 

          $('#thisGroup').
          append('<input type="button" id="removeGroupMembers" value="remove members"/>');

          /** 
           *Remove group members 
           */
          $("#removeGroupMembers").click(function() {

            $.
            post("api/groups/" + group + "/removeMembers", $("#thisGroupForm").serialize()).

            done(function(data) {

              $('#thisGroup').empty();
              $this.click();
              $('#groupsOutput').val(data);

            }).

            fail(function(data) {
              alert(data.status + '  (' + data.statusText +')');
            });

          });

        }

        if (contacts.length) {

          $('#thisGroup').append('<form id="groupNewMembersForm"></form>');

          /** Load contacts */
          contacts.forEach(function(contact) {

            isMemeber = false;

            for (i = 0; i < members.length; i++) {
              if (members[i]._id === contact._id) {
                isMemeber = true;
                break;
              }
            }

            if (!isMemeber) {
              $('#groupNewMembersForm').
              append('<input type="checkbox" name="members" value="' + contact._id+ '"/>' + contact.email + '<br>');  
            }
          });


          if (document.getElementById('groupNewMembersForm').hasChildNodes()) {

            $("<p>add new members</p>").insertBefore("#groupNewMembersForm");

            $('#thisGroup').
            append('<input type="button" id="addGroupMembers" value="add members"/>');
          }

          /** 
           * Add group members 
           */
          $("#addGroupMembers").click(function() {

            $.
            post("api/groups/" + group + "/addMembers", $("#groupNewMembersForm").serialize()).

            done(function(data) {

              $('#thisGroup').empty();
              $this.click();
              $('#groupsOutput').val(data);

            }).

            fail(function(data) {
              alert(data.status + '  (' + data.statusText +')');
            });

          });

        }

      }).

      fail(function(data) {
        alert(data.status + '  (' + data.statusText +')');
      });
    });
  }

  function loadContacts() {

    if (contacts.length) {

      $('#newGroupMembers').
      append('<p>select new group members</p>');  

      /** Load available members of a group */
      contacts.forEach(function(contact) {

        $('#newGroupMembers').
        append('<input type="checkbox" name="members" value="' + contact._id+ '"/>' + contact.email + '<br>');  

      });
    }
  }

  function loadSession() {

    $('#thisGroup').empty();
    $('#listGroups').empty();
    $('#newGroupMembers').empty();

    $./* Load session user */
    get('api/users/session').

    done(function(data) {

      user = data;

      $. /* Load session user contacts */
      get('api/contacts').

      done(function(data) {

        contacts = data;

        $./* Load session user groups */
        get('api/groups/me').

        done(function(data) {

          admin = {};
          groups = data;

          if (groups.length) {

            $('#listGroups').
            append('<h4>your groups</h4>');

            groups.forEach(function(group) {

              $('#listGroups').
              append('<input type="radio" ' +
                     'name="group" value="' + group._id+ '"/>' + group.profile.name + '<br>');

              admin[group._id] = group.admin;

            });
          } 
          displayGroups();
          loadContacts();
          alert('Welcome ' + user.email);
        });
      });
    });
  }


  loadSession();


  /** 
   * Get users list.
   */
  $('#listUsers').
  on('click', function() {

    $.
    get('api/users').

    done(function(data) {
      $('#usersOutput').val(JSON.stringify(data));
    });

  });

  /** 
   * Create a new user
   */
  $("#newUser").on('click', function() {

    $.
    post("api/users/create", $("#newUserForm").serialize()).

    done(function(data) {
      $('#usersOutput').val(data);
    }).

    fail(function(data) {
      alert(data.status + '  (' + data.statusText +')');
    });

  });

  /** 
   * Change password
   */
  $("#changePassword").on('click', function() {

    $.
    post("api/users/changePassword", $("#changePasswordForm").serialize()).

    done(function() {
      $('#usersOutput').val('Password changed');
    }).

    fail(function(data) {
      alert(data.status + '  (' + data.statusText +')\n' + data.responseText);
    });

  });

  /** 
   * Invited signin
   */
  $("#invitedSignin").on('click', function() {

    $.
    post("api/users/invited/signin", $("#invitedSigninForm").serialize()).

    done(function() {
      $('#usersOutput').val('Account activated, welcome to emeeter');
    }).

    fail(function(data) {
      alert(data.status + '  (' + data.statusText +')\n' + data.responseText);
    });

  });

  /** 
   * Login user
   */
  $("#login").on('click', function() {

    $.
    post("api/users/login", $("#loginForm").serialize()).

    done(function() {

      loadSession();
      $('#usersOutput').val('Logged in');

    }).

    fail(function(data) {
      alert(data.status + '  (' + data.statusText +')');
    });

  });

  /**
   * Recover password
   */
  $("#recoverPassword").on('click', function() {

    $.
    post("api/users/recover", $("#recoverPasswordForm").serialize()).

    done(function(data) {
      $('#usersOutput').val(data);
    }).

    fail(function(data) {
      alert(data.status + '  (' + data.statusText +')');
    });

  });

  /**
   * Reset password
   */
  $("#resetPassword").on('click', function() {

    $.
    post("api/users/resetPassword", $("#resetPasswordForm").serialize()).

    done(function(data) {
      $('#usersOutput').val(data);
    }).

    fail(function(data) {
      alert(data.status + '  (' + data.statusText +')');
    });

  });

  /** 
   * Update profile
   */
  $("#updateProfile").on('click', function() {

    $.
    post("api/profiles/", $("#updateProfileForm").serialize()).

    done(function() {
      $('#usersOutput').val('Profile updated');
    }).

    fail(function(data) {
      alert(data.status + '  (' + data.statusText +')');
    });

  });

  /** 
   * Upload profiles pictures
   */
  $("#uploadProfilePicturesForm").on('submit', function(e) {

    e.preventDefault();

    var formData = new FormData(),
        files = $("#profilePictures")[0].files,
        file, i;

    for (i = 0; i < files.length; i++) {
      file = files[i];
      formData.append('pictures[]', file, file.name);
    }

    $.ajax({
      url: 'api/profiles/pictures',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,

      success: function(data) {
        $('#usersOutput').val(data);
      },

      error: function(data) {
        alert(data);
      }
    });

  });

  /** 
   * Logout
   */
  $('#logout').on('click', function(){

    $.
    get('api/users/logout').

    done(function() {

      user = {};

      $('#newGroupMembers').empty();

      $('#listGroups').empty();

      if($('#thisGroup')) { 
        $('#thisGroup').empty();
      }

      $('#groupsOutput').val('');

      $('#usersOutput').val('Logged out');
    });

  });

  /** 
   * Clear users output
   */
  $('#clearUsersOutput').on('click', function() {

    $('#usersOutput').val('');

  });

  /** 
   * Create group
   */
  $("#createGroup").on('click', function() {

    $.
    post("api/groups/create", $("#createGroupForm").serialize()).

    done(function(data) {
      $('#groupsOutput').val('group ' + data + ' created');
    }).

    fail(function(data) {
      alert(data.status + '  (' + data.statusText +')');
    });

  });

  /** 
   * Clear groups output
   */
  $('#clearGroupsOutput').on('click', function(){

    $('#groupsOutput').val('');

  });

});
