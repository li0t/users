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
      entries;

  function loadUser(){ 

    $('#thisUser').empty();

    $. /* Load session user */
    get('api/users/session').

    done(function(data) {

      user = data;

      $('#thisUser').append('<h4>' + user.email + '</h4>');

      if (user.profile.name) {
        $('#thisUser').append('<p> name: ' + user.profile.name + '</p>');
      }

      if (user.profile.gender) {
        $('#thisUser').append('<p> gender: ' + user.profile.gender.name + '</p>');
      }

      if (user.profile.birthdate) {
        $('#thisUser').append('<p> birthdate: ' + user.profile.birthdate + '</p>');
      }

      if (user.profile.location) {
        $('#thisUser').append('<p> location: ' + user.profile.location + '</p>');
      }

      if (user.profile.pictures && user.profile.pictures.length) {

        $('#thisUser').append('<ul id="thisUserPictures" ></ul>');

        user.profile.pictures.forEach(function(pic) {

          $('#thisUserPictures').
          append('<li><img src="api/files/' + pic._id +'"  alt="' +
                 pic._filename + '"></li>');

        });
      }

      loadContacts();

      loadGroups();


    });

  }

  function loadTags() {

    $. /* Load platform tags */
    get('api/tags').
    done(function(data) {

      tags = data;
      tagsNames = [];

      tags.forEach(function(tag) { 

        tagsNames.push(tag.name);

      });
    });

  }

  function loadContacts() {

    $('#newGroupMembers').empty(); 

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

    var email, 
        input, 
        isMemeber,
        i, $this,
        newAdmin;

    $('#thisGroup').empty();
    $('#listGroups').empty();
    $('#groupsEntries').empty();
    $('#newEntryForm').empty();

    $. /* Load session user groups */
    get('api/groups/me').

    done(function(data) {

      admin = {};
      groups = data;

      if (groups.length) {

        $('#listGroups').
        append('<h4>your groups</h4>');

        groups.forEach(function(group) {    

          /** Groups list of session user */ 
          $('#listGroups').
          append('<input type="radio" ' +
                 'name="group" value="' + group._id+ '"/>' + group.profile.name + '<br>');

          /** Store de group admin */
          admin[group._id] = group.admin;

        });

        $('#listGroups').find("input[type='radio'][name=group]").click(function() {

          /** 
           * Leave group
           */
          $('#thisGroup').empty().append('<input type="button"  id="leaveGroup" value="leave group"/><br>');

          $("#leaveGroup").click(function() {

            $.
            post("api/groups/" + group + "/removeMembers", "members=" + user._id).

            done(function(data) {

              loadGroups();
              $('#groupsOutput').val(data);

            }).

            fail(function(data) {
              alert(data.status + '  (' + data.statusText +')');
            });
          });

          $('#thisGroup').append('<p>members</p>');

          $this = $(this);

          group = this.value;

          $.
          get('api/groups/' + group + '/members').

          done(function(data) {

            members = data;

            $('#thisGroup').append('<form id="thisGroupForm"></form>');

            members.forEach(function(member) {

              email = member.email;

              if (member._id === admin[group]) {

                email += ' (admin)';

              } 

              if (member.email === user.email) {

                input = '<input type="checkbox" name="members" value="' + member._id+ '" disabled/>' + email + ' (me) <br>';

              } else {

                input = '<input type="checkbox" name="members" value="' + member._id+ '"/>' + email + '<br>';

              }

              $('#thisGroupForm').append(input);

            });

            if (user._id === admin[group]) { 

              if (members.length > 1) {

                /** 
               * Remove group members 
               */
                $('#thisGroupForm').
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
                $('#thisGroup').append('<br><form id="thisGroupNewAdminForm"></form>');

                members.forEach(function(member) {

                  if (member._id !== admin[group]) {

                    $('#thisGroupNewAdminForm').
                    append('<input type="radio" name="members" value="' + member._id+ '"/>' + member.email + '<br>');

                  } 
                });

                $('#thisGroupNewAdminForm').
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
            }

            if (contacts.length) {

              /** 
               * Add group members 
               */
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

                $('#groupNewMembersForm').
                append('<input type="button" id="addGroupMembers" value="add members"/><br>');

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
            }

          }).

          fail(function(data) {
            alert(data.status + '  (' + data.statusText +')');
          });
        });
      } else {

        $('#listGroups').
        append('<h4>no groups</h4>');

      }

      loadEntries();

    });

  }

  function loadEntry($this, id) {

    $.
    get('api/entries/' + id).

    done(function(entry) {

      $('#thisEntry').
      empty().
      append('<h4>entry</h4>' +
             '<p>' + entry.title + '</p>'+
             '<p>' +entry.content + '</p>'); 

      if (entry.pictures.length) {

        $('#thisEntry').append('<ul id="thisEntryPictures" ></ul>');

        entry.pictures.forEach(function(pic) {

          $('#thisEntryPictures').
          append('<li><img src="api/files/' + pic._id +'"  alt="' +
                 pic._filename + '"></li>');

        });
      }

      if (entry.tags.length) {

        $('#thisEntry').append('tags: <ul></ul>');

        entry.tags.forEach(function(tag) {

          $('#thisEntry').
          append('<li><p>' + tag + '</p></li>');

        });
      }

      $('#thisEntry').
      append('<p>upload pictures to ' + entry.title + '</p>' +
             '<form id="entryPicturesForm" enctype="multipart/form-data">' +
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
            $this.click();
            $('#entriesOutput').val(data);
          },

          error: function(data) {
            alert(data.status + '  (' + data.statusText +')');
          }
        });
      });
    }).

    fail(function(data) { 
      alert(data.status + '  (' + data.statusText +')');
    });

  }

  function loadEntries() {

    $('#thisEntry').empty();
    $('#listGroupEntries').empty();

    /** Re-create entry form */
    $('#newEntryForm').
    empty().
    append('<h4>create an entry</h4>'+
           '<p>...will you choose a group?</p>');

    $('#groupsEntries').
    empty().
    append('<h4>groups entries</h4>');

    groups.forEach(function(group) {

      $('#groupsEntries').
      append('<input type="radio" ' +
             'name="group" value="' + group._id+ '"/>' + group.profile.name + '<br>');

      /** Available groups to create entries in*/
      $("#newEntryForm").append('<input type="radio" name="group" value="' + group._id+ '"/>' + group.profile.name + '<br>');

    });

    /** In case the entries does not belong to a group */
    $("#newEntryForm").append('<input type="radio" name="group" value=""/>none<br>');

    $('#newEntryForm').
    append('<input type="text" name="title" placeholder="title..."/><br>' +
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

        loadEntries();
        $('#entriesOutput').val('Created new entry : ' + data);

      }).

      fail(function(data) {

        alert(data.status + '  (' + data.statusText +')');

      });
    });

    $.
    get('api/entries/user/' + user._id).

    done(function(data) {

      entries = data;

      /** Load session user entries */
      if (entries.length) {

        $('#listEntries').
        empty().
        append('<h4>your entries</h4>');

        entries.forEach(function(entry) {

          $('#listEntries').
          append('<input type="radio" ' +
                 'name="entry" value="' + entry._id+ '"/>' + entry.title + '<br>');

        });
      }

      $('#listEntries').find("input[type='radio'][name=entry]").click(function() {

        loadEntry($(this), this.value);

      });
    });

    $('#groupsEntries').find("input[type='radio'][name=group]").click(function() {

      group = this.value;

      $('#listGroupEntries').empty();

      $.
      get('api/entries/group/' + group).

      done(function(entries) {

        if (entries.length) {

          for (var i = 0; i < groups.length; i++) {

            if (groups[i]._id === group) {

              $('#listGroupEntries').
              append('<h4>' + groups[i].profile.name  + ' entries</h4>');
              break;
            }
          }

          entries.forEach(function(entry) {

            $('#listGroupEntries').
            append('<input type="radio" ' +
                   'name="entry" value="' + entry._id+ '"/>' + entry.title + '<br>');

          });

          $('#listGroupEntries').find("input[type='radio'][name=entry]").click(function() {

            loadEntry($(this), this.value);

          });
        } else {
          $('#listGroupEntries').
          append('<h4>no entries</h4>');
        }
      }).

      fail(function(data) {
        alert(data.status + '  (' + data.statusText +')');
      });
    });

  }

  function loadSession() {

    loadUser();
    loadTags();

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

    $('#searchUserForm')[0].reset();

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

    $('#newUserForm')[0].reset();

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

    $('#changePasswordForm')[0].reset();

  });

  /** 
   * Invited signin
   */
  $("#invitedSignin").on('click', function() {

    $.
    post("api/users/invited/signin", $("#invitedSigninForm").serialize()).

    done(function() {
      loadSession();
      $('#usersOutput').val('Account activated, welcome to emeeter');
    }).

    fail(function(data) {
      alert(data.status + '  (' + data.statusText +')\n' + data.responseText);
    });

    $('#invitedSigninForm')[0].reset();


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
      $('#groupsOutput').val('');
      $('#entriesOutput').val('');
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

    $('#recoverPasswordForm')[0].reset();

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

    $('#resetPasswordForm')[0].reset();

  });

  /** 
   * Update profile
   */
  $("#updateProfile").on('click', function() {

    $.
    post("api/profiles/", $("#updateProfileForm").serialize()).

    done(function() {

      $('#thisUser').empty();
      loadUser();

      $('#usersOutput').val('Profile updated');

    }).

    fail(function(data) {
      alert(data.status + '  (' + data.statusText +')');
    });

    $('#updateProfileForm')[0].reset();


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
        loadUser();
        $('#usersOutput').val(data);
      },

      error: function(data) {
        alert(data.status + '  (' + data.statusText +')');
      }
    });

    $('#uploadProfilePicturesForm')[0].reset();

  });

  /** 
   * Logout
   */
  $('#logout').on('click', function() {

    $.
    get('api/users/logout').

    done(function() {

      user = {};

      $('#thisUser').empty();
      $('#thisEntry').empty();

      if ($('#thisGroup')) { 
        $('#thisGroup').empty();
      }

      $('#groupsEntries').empty();
      $('#listGroups').empty();
      $('#listGroupEntries').empty();
      $('#listEntries').empty();

      $('#newEntryForm').empty();
      $('#newGroupMembers').empty();

      $('#groupsOutput').val('');
      $('#entriesOutput').val('');
      $('#usersOutput').val('Logged out');

    });

  });

  /** 
   * Create group
   */
  $("#createGroup").on('click', function() {

    $.
    post("api/groups/create", $("#createGroupForm").serialize()).

    done(function(data) {
      loadGroups();
      $('#groupsOutput').val('group ' + data + ' created');
    }).

    fail(function(data) {
      alert(data.status + '  (' + data.statusText +')');
    });

    $('#createGroupForm')[0].reset();

  });

  /** 
   * Clear users output
   */
  $('#clearUsersOutput').on('click', function() {

    $('#usersOutput').val('');

  });

  /** 
   * Clear groups output
   */
  $('#clearGroupsOutput').on('click', function() {

    $('#groupsOutput').val('');

  });

  /** 
   * Clear entries output
   */
  $('#clearEntriesOutput').on('click', function() {

    $('#entriesOutput').val('');

  });

});
