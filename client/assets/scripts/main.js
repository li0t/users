/*global $ */
/*global document */
/*global FormData */

$(document).ready(function() {

  var contacts,
      groups,
      user,
      group,
      admin,
      members, 
      tags, 
      tagsNames, 
      entries, 
      entry;

  function loadTags() {

    $. /* Load platform tags */
    get('/api/tags').
    done(function(data) {

      tags = data;
      tagsNames = [];

      data.forEach(function(tag){ 

        tagsNames.push(tag.name);

      });
    });

  }

  function loadContacts() {

    $. /* Load session user contacts */
    get('api/contacts').

    done(function(data) {

      contacts = data;

      if (contacts.length) {

        $('#newGroupMembers').
        append('<p>select new group members</p>');  

        /** Load available members of a group */
        contacts.forEach(function(contact) {

          $('#newGroupMembers').
          append('<input type="checkbox" name="members" value="' + contact._id+ '"/>' + contact.email + '<br>');  

        });
      }
    });

  }

  function loadGroups() {

    var email, isMemeber, i, $this, newAdmin;

    $./* Load session user groups */
    get('api/groups/me').

    done(function(data) {

      admin = {};
      groups = data;

      if (groups.length) {

        $('#listGroups').
        append('<h4>your groups</h4>');

        $('<p>...will you choose a group?</p><br>').
        insertBefore("#newEntryForm");

        groups.forEach(function(group) {    

          /** Groups list of session user */ 
          $('#listGroups').
          append('<input type="radio" ' +
                 'name="group" value="' + group._id+ '"/>' + group.profile.name + '<br>');

          /** Available groups to create entries in*/
          $('<input type="radio" name="group" value="' + group._id+ '"/>' + group.profile.name + '<br>').
          insertBefore("#newEntryForm");

          /** Store de group admin */
          admin[group._id] = group.admin;

        });
      } 
    });

    $('#listGroups').find("input[type='radio'][name=group]").click(function() {

      $('#thisGroup').empty().append('<p>members</p>');

      $this = $(this);

      group = this.value;
      
      $.
      get('api/groups/' + group + '/members').

      done(function(data) {

        members = data;

        $('#thisGroup').append('<form id="thisGroupForm"></form>');

        members.forEach(function(member) {

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

          /** 
           * Remove group members 
           */
          $('#thisGroup').
          append('<input type="button" id="removeGroupMembers" value="remove members"/>');

          $("#removeGroupMembers").click(function() {

            $.
            post("api/groups/" + group + "/removeMembers", $("#thisGroupForm").serialize()).

            done(function(data) {

              $this.click();
              $('#groupsOutput').val(data);

            }).

            fail(function(data) {

              alert(data.status + '  (' + data.statusText +')');

            });
          });

          /** 
           * Change group administrator
           */
          $('#thisGroup').append('<form id="thisGroupNewAdminForm"></form>');

          members.forEach(function(member) {

            if (member._id !== admin[group]) {

              $('#thisGroupNewAdminForm').
              append('<input type="radio" name="members" value="' + member._id+ '"/>' + member.email + '<br>');

            } 
          });

          $('#thisGroup').
          append('<input type="button" id="changeGroupAdmin" value="change admin"/>');

          $("#changeGroupAdmin").click(function() {

            newAdmin = $('#thisGroupNewAdminForm').find('input[name="members"]:checked').val();

            $.
            get("api/groups/" + group + "/changeAdmin/" + newAdmin).

            done(function(data) {

              admin[group] = newAdmin;
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

  function loadEntries() {

    var $this;

    $.
    get('api/entries/user/' + user._id).

    done(function(data) {

      entries = [];

      data.forEach(function(entry) {

        entries[entry._id] = entry;

      });

      /** Load session user entries */
      if (entries.length) {

        $('#listEntries').
        append('<h4>your entries</h4>');

        entries.forEach(function(entry) {    

          $('#listEntries').
          append('<input type="radio" ' +
                 'name="entry" value="' + entry._id+ '"/>' + entry.title + '<br>');

        });

      }
      console.log('oink');
      $('#listEntries').find("input[type='radio'][name=entry]").click(function() {

        $this = $(this);

        entry = entries[this.value];

        $('#thisEntry').
        empty().
        append('<p>' + entry.title + '</p><br>'+
               '<p>' +entry.content + '</p><br>' + 
               '<form id="entryPicturesForm" enctype="multipart/form-data">' +
               '<p>upload pictures</p>' +
               '<input type="file" id="entryPictures" multiple/><br>' +
               '<input type="submit" value="upload"/>' +
               '</form>'
              );

        /** 
         * Upload entry pictures
         */
        $("#entryPicturesForm").on('submit', function(e) {

          e.preventDefault();

          var formData = new FormData(),
              files = $("#entryPictures")[0].files,
              file, i;

          for (i = 0; i < files.length; i++) {
            file = files[i];
            formData.append('pictures[]', file, file.name);
          }

          $.ajax({
            url: 'api/entries/' + entry._id +'/pictures',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,

            success: function(data) {
              $('#entriesOutput').val(data);
            },

            error: function(data) {
              alert(data);
            }
          });
        });
      });

      /** In case the entries does not belong to a group */
      $("#newEntryForm").append('<input type="radio" name="group" value=""/>none<br>');

      /** Re-create entry form */
      $('#newEntryForm').
      append('<h4>create an entry</h4><br>' +
             '<input type="text" name="title" placeholder="title..."/><br>' +
             '<textarea rows="8" cols="8" name="content" placeholder="content..."></textarea><br>' +
             '<ul id="entryTags" name="tags"></ul>  ' +
             '<input type="button" id="createEntry" value="send"/><br>'
            );


      $("#entryTags").tagit({
        availableTags: tagsNames,
        placeholderText: 'add new tag here...'
      });

      $('#createEntry').click(function() {

        $.
        post("api/entries/create", $("#newEntryForm").serialize()).

        done(function(data) {

          $('#newEntryForm')[0].reset();
          $('#entriesOutput').val('Created new entry : ' + data);

        }).

        fail(function(data) {
          alert(data.status + '  (' + data.statusText +')');
        });

        console.log('entry: ' + $("#newEntryForm").serialize());

      });

    });

  }

  function loadSession() {

    $('#thisGroup').empty();
    $('#listGroups').empty();
    $('#newEntryForm').empty();
    $('#newGroupMembers').empty(); 


    $. /* Load session user */
    get('api/users/session').

    done(function(data) {

      user = data;

      loadTags();
      loadContacts();
      loadGroups();
      loadEntries();
      alert('Welcome ' + user.email);

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
   * Search a user
   */
  $("#searchUser").on('click', function() {

    var email = $('#searchUserForm').find('input[name="email"]').val(),
        isContact = false, i;

    $.
    post("api/search/email", $("#searchUserForm").serialize()).

    done(function(data) {

      if (user._id === data) { 

        $('#usersOutput').val("That's yourself, great!");

      } else {

        for (i = 0; i < contacts.length; i++) { 

          if (contacts[i]._id === data) {

            isContact = true;
            $('#usersOutput').val("That's your old friend " + data);
            break;

          }
        }

        if (!isContact) {

          if (confirm("User " + email + " was found, would you like send a contact request") === true) {

            $. /* Create a new user and invite it to emeeter */
            get('api/contacts/add/' + data).

            done(function(data) {
              $('#usersOutput').val(data);
            }).

            fail(function(data) {
              alert(data.status + '  (' + data.statusText +')');
            });
          } else {

            $('#usersOutput').val("User " + data);

          }
        }
      }
    }).

    fail(function(data) {

      if (data.status === 404) {

        $('#usersOutput').val(data.statusText);

        if (confirm("User " + email + " was not found, would you like send an emeeter invite?") === true) {

          $. /* Create a new user and invite it to emeeter */
          get('api/users/createAndInvite/' + email).

          done(function(data) {
            $('#usersOutput').val(data);
          }).

          fail(function(data) {
            alert(data.status + '  (' + data.statusText +')');
          });
        } else {
          $('#usersOutput').val("User not found!");
        }
      } else {

        alert(data.status + '  (' + data.statusText +')');

      }
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
      $('#loginForm')[0].reset();
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

      $('#newEntryForm').empty();

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
