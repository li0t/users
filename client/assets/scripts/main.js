/*global $ */
/*global document */
/*global FormData */

$(document).ready(function() {

  var user;
  var statics;
  var tagsNames;

  function loadStatics() {

    $. /** Load platform tags */
    get('api/statics/?statics=gender&statics=state&statics=priority').
    done(function(data) {

      statics = data;

      statics.gender.forEach(function(gender) {

        $('#genders').append('<option value="' + gender._id + '">' + gender.slug + '</option>');

      });
    });

  }

  function loadTags() {

    $. /** Load platform tags */
    get('api/tags').
    done(function(tags) {

      tagsNames = [];

      tags.forEach(function(tag) {

        tagsNames.push(tag.name);

      });
    });

  }

  function loadUser() {

    $('#thisUser').empty();

    $. /** Load session user */
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
          append('<li><img src="api/files/' + pic._id + '"  alt="' +
            pic._filename + '"></li>');

        });
      }

      loadContacts();

      loadGroups();

    });

  }

  function loadContacts() {

    var i;
    var contact;
    var token;

    $('#newGroupMembers').empty();

    $. /** Load session user contacts */
    get('api/contacts').

    done(function(contacts) {

      if (contacts.length) {

        $('#thisUser').append('<form id="contactsForm"></form>');

        $('#contactsForm').
        append('<p>contacts</p>');

        $('#newGroupMembers').
        append('<p>select new group members</p>');

        /** Load available members of a group */
        contacts.forEach(function(contact) {

          $("#contactsForm").
          append('<input type="radio" name="contact" value="' + contact._id + '"/>' + contact.email + '<br>');

          $('#newGroupMembers').
          append('<input type="checkbox" name="members" value="' + contact._id + '"/>' + contact.email + '<br>');

        });

        $('#contactsForm').
        append('<input type="button" id="deleteContact" value="delete contact"/><br>');

        $('#deleteContact').click(function() {

          contact = $('#contactsForm').find('input[name="contact"]:checked').val();

          $.
          get("api/contacts/delete/" + contact).

          done(function(data) {

            loadUser();
            $('#usersOutput').val(data);

          }).

          fail(function(data) {

            alert(data.status + '  (' + data.statusText + ')');

          });
        });
      }
    });

    $. /** Get pending contact requests of session user */
    get('/api/contacts/pending').

    done(function(pending) {

      if (pending.length) {

        $('#thisUser').append('<form id="pendingContactsForm"></form>');

        $('#pendingContactsForm').
        append('<p>contacts requests</p>');

        pending.forEach(function(pending) {

          $("#pendingContactsForm").
          append('<input type="radio" name="contact" value="' + pending._id + '"/>' + pending.email + '<br>');

        });

        $('#pendingContactsForm').
        append('<input type="button" id="rejectContact" value="reject"/><br>');

        $('#pendingContactsForm').
        append('<input type="button" id="confirmContact" value="confirm"/><br>');

        /** Confirm contact request */
        $('#confirmContact').click(function() {

          contact = $('#pendingContactsForm').find('input[name="contact"]:checked').val();

          for (i = 0; i < pending.length; i++) {

            if (pending[i]._id === contact) {

              token = pending[i].token;
              break;

            }
          }

          $.
          get("api/contacts/confirm/" + token).

          done(function(data) {

            loadUser();
            $('#usersOutput').val(data);

          }).

          fail(function(data) {

            alert(data.status + '  (' + data.statusText + ')');

          });
        });

        /** Reject contact request */
        $('#rejectContact').click(function() {

          contact = $('#pendingContactsForm').find('input[name="contact"]:checked').val();

          $.
          get("api/contacts/delete/" + contact).

          done(function(data) {

            loadUser();
            $('#usersOutput').val(data);

          }).

          fail(function(data) {

            alert(data.status + '  (' + data.statusText + ')');

          });
        });
      }
    }).

    fail(function(data) {

      alert(data.status + '  (' + data.statusText + ')');

    });

  }

  function loadGroups() {

    var email;
    var input;
    var isMemeber;
    var i;
    var $this;
    var newAdmin;
    var group;
    var admin = {};

    $('#thisGroup').empty();
    $('#listGroups').empty();
    $('#groupsEntries').empty();

    $. /* Load session user groups */
    get('api/groups/me').

    done(function(groups) {

      if (groups.length) {

        $('#listGroups').
        append('<h4>your groups</h4>');

        groups.forEach(function(group) {

          /** Groups list of session user */
          $('#listGroups').
          append('<input type="radio" ' +
            'name="group" value="' + group._id + '"/>' + group.profile.name + '<br>');

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

              alert(data.status + '  (' + data.statusText + ')');

            });
          });

          $('#thisGroup').append('<p>members</p>');

          $this = $(this);

          group = this.value;

          $.
          get('api/groups/' + group + '/members').

          done(function(members) {

            $('#thisGroup').append('<form id="thisGroupForm"></form>');

            members.forEach(function(member) {

              member = member.user;

              email = member.email;

              if (member._id === admin[group]) {

                email += ' (admin)';

              }

              if (member.email === user.email) {

                input = '<input type="checkbox" name="members" value="' + member._id + '" disabled/>' + email + ' (me) <br>';

              } else {

                input = '<input type="checkbox" name="members" value="' + member._id + '"/>' + email + '<br>';

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

                    alert(data.status + '  (' + data.statusText + ')');

                  });
                });

                /**
                 * Change group administrator
                 */
                $('#thisGroup').append('<br><form id="thisGroupNewAdminForm"></form>');

                members.forEach(function(member) {

                  member = member.user;

                  if (member._id !== admin[group]) {

                    $('#thisGroupNewAdminForm').
                    append('<input type="radio" name="members" value="' + member._id + '"/>' + member.email + '<br>');

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
                    alert(data.status + '  (' + data.statusText + ')');

                  });
                });
              }
            }

            $.
            get('api/contacts').

            done(function(contacts) {

              if (contacts.length) {

                /**
                 * Add group members
                 */
                $('#thisGroup').append('<form id="groupNewMembersForm"></form>');

                /** Load contacts */
                contacts.forEach(function(contact) {

                  isMemeber = false;

                  for (i = 0; i < members.length; i++) {

                    if (members[i].user._id === contact._id) {

                      isMemeber = true;
                      break;

                    }
                  }

                  if (!isMemeber) {

                    $('#groupNewMembersForm').
                    append('<input type="checkbox" name="members" value="' + contact._id + '"/>' + contact.email + '<br>');

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

                      alert(data.status + '  (' + data.statusText + ')');

                    });
                  });
                }
              }
            }).

            fail(function(data) {

              alert(data.status + '  (' + data.statusText + ')');

            });
          }).

          fail(function(data) {

            alert(data.status + '  (' + data.statusText + ')');

          });
        });

      } else {

        $('#listGroups').
        append('<h4>no groups</h4>');

      }

      loadEntries();

    });

  }

  function loadTask($this, id) {

    var note;
    var i;
    var isCollaborator;
    var collaborators;
    var $button;
    var $that;
    var url;
    var index = 0;


    $. /** Get the task document */
    get('api/tasks/' + id).

    done(function(task) {

      collaborators = task.collaborators;

      $. /** Get the members of task group */
      get('api/groups/' + task.group._id + '/members').

      done(function(members) {

        $('#thisTask').empty().append('<form id="thisTaskForm"></form>');

        $('#thisTaskForm').
        append('<p>group: ' + task.group.profile.name + '</p>' +
          '<h4>task</h4>' +
          '<p id="thisTaskState"></p>' +
          '<p id="taskPriority" >priority: ' + task.priority.slug + ' </p>' +
          '<input type="button" name="editTask" id="editTaskPriority" value="edit" /><br>' +
          '<br><p id="taskObjective" >objective:<br>' + task.objective + '</p>' +
          '<input type="button" name="editTask" id="editTaskObjective" value="edit" /><br>' +
          '<p id="thisTaskDateTime"></p>' +
          '<input type="button" name="editTask" id="editTaskDateTime" value="edit" /><br>' +
          '<input type="button" name="editTask" id="makeTaskDateTimePoll" value="make poll" /><br>');

        if (task.dateTime) {

          $('#thisTaskDateTime').text('datetime: ' + task.dateTime);

        } else {

          $('#thisTaskDateTime').text('datetime not set');

        }

        if (!task.completed) {

          $('#thisTaskState').text('active');
          $('#thisTaskForm').append('<br><input type="button" name="editTask" id="completeTask" value="complete" />');
          $('#thisTaskForm').append('<input type="button" name="editTask" id="deleteTask" value="delete" />');

        } else {

          $('#thisTaskState').text('completed');
          $('#thisTaskForm').find("input[name=editTask]").attr('type', 'hidden');
          $('#thisTaskForm').append('<br><input type="button" name="editTask" id="reOpenTask" value="re-open" />');

        }



        /** Add listeners to edit task buttons */
        $('#thisTaskForm').find("input[name=editTask]").click(function() {

          $button = $(this);

          if (this.id === 'completeTask') {

            if (confirm('Do you really want to set this task as completed?') === true) {
              $.
              ajax({

                url: 'api/tasks/' + task._id + '/complete',
                type: 'PUT',

                success: function(data) {
                  $('#thisTask').empty();
                  $('#tasksOutput').val(data);
                  loadTasks();

                  $('#listTasks').
                  find("input[type='radio'][name=task][value=" + $this.val() + "]").
                  trigger('click');

                },

                error: function(data) {

                  alert(data.status + '  (' + data.statusText + ')');

                }
              });
            }

          } else if (this.id === 'reOpenTask') {

            $.
            ajax({

              url: 'api/tasks/' + task._id + '/re-open',
              type: 'PUT',

              success: function(data) {

                $('#thisTask').empty();
                $('#tasksOutput').val(data);
                loadTasks();

                $('#listTasks').
                find("input[type='radio'][name=task][value=" + $this.val() + "]").
                trigger('click');

              },

              error: function(data) {

                alert(data.status + '  (' + data.statusText + ')');

              }
            });

          } else if (this.id === 'deleteTask') {

            if (confirm('Are you sure you want to delete this task?\n(This action cannot be reverted)') === true) {

              $.
              ajax({

                url: 'api/tasks/' + task._id + '/delete',
                type: 'PUT',

                success: function(data) {

                  $('#thisTask').empty();
                  $('#tasksOutput').val(data);
                  loadTasks();

                  $('#listTasks').
                  find("input[type='radio'][name=task][value=" + $this.val() + "]").
                  trigger('click');

                },

                error: function(data) {

                  alert(data.status + '  (' + data.statusText + ')');

                }
              });
            }

          } else if (this.id === 'makeTaskDateTimePoll') {

            alert('Create a poll, GREAT!');

          } else if ($button.val() === 'edit') {

            if (this.id === 'editTaskPriority') {

              $('#taskPriority').replaceWith('<select name="priority" ></select>');

              $that = $("#thisTaskForm").find("select[name=priority]");

              $that.append('<option value="">select</option>');

              statics.priority.forEach(function(priority) {

                $that.append('<option value="' + priority._id + '">' + priority.slug + '</option>');

              });

              $button.val('send');

            } else if (this.id === 'editTaskObjective') {

              $that = $('#taskObjective');

              $that.
              replaceWith('<textarea rows="4" cols="8" id="taskObjective" name="objective" placeholder="' +
                task.objective + '"></textarea>');

              $button.val('send');

            } else if (this.id === 'editTaskDateTime') {

              $that = $('#thisTaskDateTime');

              $that.
              replaceWith('<br><input type="text" name="dateTime" id="thisTaskDateTime" placeholder="date time"/>');

              $('#thisTaskDateTime').datepicker();

              $button.val('send');

            }

            /**
             * Edit task fields
             */
          } else if ($button.val() === 'send') {

            /** Edit task priority */
            if (this.id === 'editTaskPriority') {

              $.
              post('api/tasks/' + task._id + '/priority', $("#thisTaskForm").serialize()).

              done(function(data) {

                $('#thisTask').empty();
                $('#tasksOutput').val(data);
                loadTasks();

                $('#listTasks').
                find("input[type='radio'][name=task][value=" + $this.val() + "]").
                trigger('click');

              }).

              fail(function(data) {

                alert(data.status + '  (' + data.statusText + ')');

              });


              /** Edit task objective */
            } else if (this.id === 'editTaskObjective') {

              $.
              post("api/tasks/" + task._id + "/objective", $("#thisTaskForm").serialize()).

              done(function(data) {

                $('#thisTask').empty();
                $('#tasksOutput').val(data);
                loadTasks();

                $('#listTasks').
                find("input[type='radio'][name=task][value=" + $this.val() + "]").
                trigger('click');

              }).

              fail(function(data) {

                alert(data.status + '  (' + data.statusText + ')');

              });

              /** edit task date time */
            } else if (this.id === 'editTaskDateTime') {

              $.
              post("api/tasks/" + task._id + "/dateTime", $("#thisTaskForm").serialize()).

              done(function(data) {

                $('#thisTask').empty();
                $('#tasksOutput').val(data);
                loadTasks();

                $('#listTasks').
                find("input[type='radio'][name=task][value=" + $this.val() + "]").
                trigger('click');

              }).

              fail(function(data) {

                alert(data.status + '  (' + data.statusText + ')');

              });
            }
          }
        });

        $('#thisTask').append('<form id="thisTaskNotes" ><p>notes</p></form>');

        /** Load task notes */
        if (task.notes.length) {

          for (index = 0; index < task.notes.length; index++) {

            $('#thisTaskNotes').
            append('<p name="note" id="note' + index + '">' + task.notes[index].note + '</p>' +
              '<input type="button" name="deleteNote" id="' + index + '" value="delete"/>');

          }

          $('#thisTaskNotes').find('input[name=deleteNote]').click(function() {

            note = $('note' + this.id).text();

            $.
            post('api/tasks/' + task._id + '/removeNotes', "notes=" +  note).

            done(function(data) {

              $('#thisTask').empty();
              $('#tasksOutput').val(data);
              loadTasks();

              $('#listTasks').
              find("input[type='radio'][name=task][value=" + $this.val() + "]").
              trigger('click');

            }).

            fail(function(data) {

              alert(data.status + '  (' + data.statusText + ')');

            });

          });

        } else {

          $('#thisTaskNotes').append('<p>no notes</p>');

        }

        $('#thisTaskNotes').
        append('<textarea rows="8" cols="8" id="newNote" placeholder="note..."></textarea>' +
          '<input type="button" id="addNewNote" value="add new note"/>');

          $('#addNewNote').click(function() {

            note = $('#newNote').val();

            $.
            post('api/tasks/' + task._id + '/addNotes',  {
              "notes": note
            }).

            done(function(data) {

              $('#thisTask').empty();
              $('#tasksOutput').val(data);
              loadTasks();

              $('#listTasks').
              find("input[type='radio'][name=task][value=" + $this.val() + "]").
              trigger('click');

            }).

            fail(function(data) {

              alert(data.status + '  (' + data.statusText + ')');

            });


          });

        /** Load task collaborators */
        if (task.collaborators.length) {

          $('#thisTask').append('<form id="thisTaskCollaborators" ><p>collaborators</p></form>');

          task.collaborators.forEach(function(collaborator) {

            $('#thisTaskCollaborators').
            append('<input type="checkbox" ' +
              'name="collaborators" value="' + collaborator._id + '"/>' + collaborator.email + '<br>');

          });

          if (document.getElementById('thisTaskCollaborators').hasChildNodes()) {

            /**
             * Remove task collaborators
             */
            $('#thisTaskCollaborators').
            append('<input type="button" id="removeTaskCollaborators" value="remove collaborators"/><br>');

            $("#removeTaskCollaborators").click(function() {

              $.
              post("api/tasks/" + task._id + "/removeCollaborators", $("#thisTaskCollaborators").serialize()).

              done(function(data) {

                $('#thisTask').empty();
                $('#tasksOutput').val(data);
                loadTasks();

                $('#listTasks').
                find("input[type='radio'][name=task][value=" + $this.val() + "]").
                trigger('click');

              }).

              fail(function(data) {

                alert(data.status + '  (' + data.statusText + ')');

              });
            });
          }
        }

        /**
         * Add task collaborators
         */
        $('#thisTask').append('<form id="newTaskCollaborators"></form>');

        /** Load contacts */
        members.forEach(function(member) {

          member = member.user;

          isCollaborator = false;

          for (i = 0; i < collaborators.length; i++) {

            if (collaborators[i]._id === member._id) {

              isCollaborator = true;
              break;

            }
          }

          if (!isCollaborator) {

            $('#newTaskCollaborators').
            append('<input type="checkbox" name="collaborators" value="' + member._id + '"/>' + member.email + '<br>');

          }
        });

        if (document.getElementById('newTaskCollaborators').hasChildNodes()) {

          $('#newTaskCollaborators').
          append('<input type="button" id="addTaskCollaborators" value="add collaborators"/><br>');

          $("#addTaskCollaborators").click(function() {

            $.
            post("api/tasks/" + task._id + "/addCollaborators", $("#newTaskCollaborators").serialize()).

            done(function(data) {

              $('#thisTask').empty();
              $('#tasksOutput').val(data);
              loadTasks();

              $('#listTasks').
              find("input[type='radio'][name=task][value=" + $this.val() + "]").
              trigger('click');

            }).

            fail(function(data) {

              alert(data.status + '  (' + data.statusText + ')');

            });
          });
        }

        /** Load task entries */
        if (task.entries.length) {

          $('#thisTask').append('<form id="thisTaskEntries" ><p>entries</p></form>');

          task.entries.forEach(function(entry) {

            $('#thisTaskEntries').
            append('<input type="checkbox" ' +
              'name="entry" value="' + entry._id + '"/>' + entry.title + '<br>');

          });

          $('#thisTaskEntries').
          append('<input type="button" id="removeEntries" value="remove entries"/><br>');

        }

        /** Prevent changes for completed or disabled tasks */
        if (task.slug === 'completed' || task.slug === 'disabled') {

          $('#editTaskPriority').prop('disabled', true);
          $('#editTaskObjective').prop('disabled', true);
          $('#editTaskDateTime').prop('disabled', true);
          $('#addTaskCollaborators').prop('disabled', true);
          $('#removeTaskCollaborators').prop('disabled', true);
          $('#addEntries').prop('disabled', true);
          $('#removeEntries').prop('disabled', true);

        }

      }).

      fail(function(data) {

        alert(data.status + '  (' + data.statusText + ')');

      });
    }).

    fail(function(data) {

      alert(data.status + '  (' + data.statusText + ')');

    });

  }

  function loadTasks() {

    var group;

    $.
    get("api/groups/me").

    done(function(groups) {

      $('#thisTask').empty();
      $('#listTasks').empty();
      $('#listGroupTasks').empty();

      /** Re-create entry form */
      $('#newTaskForm').
      empty().
      append('<h4>create a Task</h4>' +
        '<select name="group"></select>' +
        '<select name="priority"></select>');

      $('#groupsTasks').
      empty().
      append('<h4>your groups tasks</h4>');

      $("#newTaskForm").
      find("select[name=group]").
      append('<option value="">group</option>');

      groups.forEach(function(group) {

        $('#groupsTasks').
        append('<input type="radio" ' +
          'name="group" value="' + group._id + '"/>' + group.profile.name + '<br>');

        /** Available groups to create tasks in*/
        $("#newTaskForm").
        find("select[name=group]").
        append('<option value="' + group._id + '">' + group.profile.name + '</option>');

      });

      $("#newTaskForm").
      find("select[name=priority]").
      append('<option value="">priority</option>');

      statics.priority.forEach(function(priority) {

        /** Available priorities*/
        $("#newTaskForm").
        find("select[name=priority]").
        append('<option value="' + priority._id + '">' + priority.slug + '</option>');

      });

      $('#newTaskForm').
      append('<input type="text" name="objective" placeholder="objective..."/><br>' +
        '<input type="text" name="dateTime" id="taskDateTime" placeholder="date time"/>' +
        '<input type="button" id="createTask" value="send"/><br>');

      $('#taskDateTime').datepicker();

      $('#createTask').click(function() {

        $.
        post("api/tasks/create", $("#newTaskForm").serialize()).

        done(function(data) {

          loadTasks();
          $('#tasksOutput').val('Created new task : ' + data);

        }).

        fail(function(data) {

          if (data.responseText) {

            alert(data.responseText);

          } else {

            alert(data.status + '  (' + data.statusText + ')');

          }
        });

        $("#newTaskForm")[0].reset();

      });

      /** Load session user tasks */
      $.
      get('/api/tasks/me').

      done(function(tasks) {

        if (tasks.length) {

          $('#listTasks').
          empty().
          append('<h4>your tasks</h4>');

          tasks.forEach(function(task) {

            $('#listTasks').
            append('<input type="radio" ' +
              'name="task" value="' + task._id + '"/>' + task.objective + '<br>');

          });
        }

        $. /** Load session user tasks */
        get('/api/tasks/collaborator').

        done(function(tasks) {

          if (tasks.length) {

            $('#listTasks').
            append('<h4>your assigned tasks</h4>');

            tasks.forEach(function(task) {

              $('#listTasks').
              append('<input type="radio" ' +
                'name="task" value="' + task._id + '"/>' + task.objective + '<br>');

            });
          }

          /** Add listeners to tasks radios */
          $('#listTasks').find("input[type='radio'][name=task]").click(function() {

            loadTask($(this), this.value);

          });
        }).

        fail(function(data) {

          alert(data.status + '  (' + data.statusText + ')');

        });

        $('#groupsTasks').find("input[type='radio'][name=group]").click(function() {

          group = this.value;

          $('#listGroupTasks').empty();

          $. /**Load all tasks of a group */
          get('api/tasks/group/' + group).

          done(function(tasks) {

            if (tasks.length) {

              for (var i = 0; i < groups.length; i++) {

                if (groups[i]._id === group) {

                  $('#listGroupTasks').
                  append('<h4>' + groups[i].profile.name + ' tasks</h4>');
                  break;

                }
              }

              tasks.forEach(function(task) {

                $('#listGroupTasks').
                append('<input type="radio" ' +
                  'name="task" value="' + task._id + '"/>' + task.objective + '<br>');

              });

              $('#listGroupTasks').find("input[type='radio'][name=task]").click(function() {

                loadTask($(this), this.value);

              });

            } else {

              $('#listGroupTasks').
              append('<h4>no tasks</h4>');

            }
          }).

          fail(function(data) {

            alert(data.status + '  (' + data.statusText + ')');

          });
        });
      }).

      fail(function(data) {

        alert(data.status + '  (' + data.statusText + ')');

      });
    }).

    fail(function(data) {

      alert(data.status + '  (' + data.statusText + ')');

    });

  }

  function loadEntry($this, id) {

    $.
    get('api/entries/' + id).

    done(function(entry) {

      $('#thisEntry').
      empty().
      append('<form id="shareEntryForm"></form>' +
        '<input type="button" id="shareThisEntry" value="share"/>' +
        '<h4>entry</h4>' +
        '<p>' + entry.title + '</p>' +
        '<p>' + entry.content + '</p>');

      if (entry.pictures.length) {

        $('#thisEntry').append('<ul id="thisEntryPictures" ></ul>');

        entry.pictures.forEach(function(pic) {

          $('#thisEntryPictures').
          append('<li><img src="api/files/' + pic._id + '"  alt="' +
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
        '<input type="submit" value="upload"/></form>');

      /**
       * Upload entry pictures
       */
      $("#entryPicturesForm").on('submit', function(e) {

        e.preventDefault();

        var formData = new FormData();
        var files = $("#entryPictures")[0].files;
        var file;
        var i;

        for (i = 0; i < files.length; i++) {

          file = files[i];
          formData.append('pictures[]', file, file.name);

        }

        $.ajax({

          url: 'api/entries/' + entry._id + '/pictures',
          type: 'POST',
          data: formData,
          processData: false,
          contentType: false,

          success: function(data) {

            $this.click();
            $('#entriesOutput').val(data);

          },

          error: function(data) {

            alert(data.status + '  (' + data.statusText + ')');

          }
        });
      });

      $('#shareThisEntry').click(function() {

        var i;
        var isPresent;
        var task;
        var form;
        var loaded = 0;
        var tasks = [];
        var groups;

        form = $('#shareEntryForm');

        form.empty();

        function loadShareEntryForm() {

          if (loaded === groups.length) {

            tasks.forEach(function(task) {

              form.append('<input type="radio" name="task" value="' +
                task._id + '"/>task > group: ' + task.group.profile.name + '/ objective: ' + task.objective + '<br>');

            });

            form.append('<input type="button" value="share"/>');

            form.dialog({
              title: "share entry",
              position: "top"
            });

            form.find('input[type=button]').click(function() {

              task = form.find('input[name="task"]:checked').val();

              $.
              post('api/entries/task/' + task + '/add', {
                "entries": entry._id
              }).

              done(function(data) {

                $('#entriesOutput').val(data);

              }).

              fail(function(data) {

                alert(data.status + '  (' + data.statusText + ')');

              });
            });
          }
        }

        $. /** Get groups session user belongs to */
        get('api/groups/me').

        done(function(_groups) {

          groups = _groups;

          groups.forEach(function(group) {

            $. /** Get tasks of each group */
            get('api/tasks/group/' + group._id).

            done(function(found) {

              found.forEach(function(task) {

                isPresent = false;

                for (i = 0; i < task.entries.length; i++) {

                  if (task.entries[i].entry === entry._id) {

                    isPresent = true;
                    break;

                  }
                }

                if (isPresent) {

                  found.splice(i, 1);

                }
              });

              loaded += 1;
              tasks = tasks.concat(found);
              loadShareEntryForm();

            }).

            fail(function(data) {

              loaded += 1;
              console.log(data);
              loadShareEntryForm();

            });
          });
        }).

        fail(function(data) {

          alert(data.status + '  (' + data.statusText + ')');

        });

      });
    }).

    fail(function(data) {

      alert(data.status + '  (' + data.statusText + ')');

    });

  }

  function loadEntries() {

    var group;

    $. /** Load groups that session user is part of */
    get("api/groups/me").

    done(function(groups) {

      $('#thisEntry').empty();
      $('#listEntries').empty();
      $('#listGroupEntries').empty();

      /** Re-create entry form */
      $('#newEntryForm').
      empty().
      append('<h4>create an entry</h4>' +
        '<p>...will you choose a group?</p>');

      $('#groupsEntries').
      empty().
      append('<h4>groups entries</h4>');

      groups.forEach(function(group) {

        $('#groupsEntries').
        append('<input type="radio" ' +
          'name="group" value="' + group._id + '"/>' + group.profile.name + '<br>');

        /** Available groups to create entries in*/
        $("#newEntryForm").
        append('<input type="radio" name="group" value="' +
          group._id + '"/>' + group.profile.name + '<br>');

      });

      /** In case the entries does not belong to a group */
      $("#newEntryForm").append('<input type="radio" name="group" value=""/>none<br>');

      $('#newEntryForm').
      append('<input type="text" name="title" placeholder="title..."/><br>' +
        '<textarea rows="8" cols="8" name="content" placeholder="content..."></textarea><br>' +
        '<ul id="entryTags" name="tags"></ul>  ' +
        '<input type="button" id="createEntry" value="send"/><br>');

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

          alert(data.status + '  (' + data.statusText + ')');

        });
      });

      $.
      get('api/entries/user/' + user._id).

      done(function(entries) {

        /** Load session user entries */
        if (entries.length) {

          $('#listEntries').
          empty().
          append('<h4>your entries</h4>');

          entries.forEach(function(entry) {

            $('#listEntries').
            append('<input type="radio" ' +
              'name="entry" value="' + entry._id + '"/>' + entry.title + '<br>');

          });
        }

        $('#listEntries').find("input[type='radio'][name=entry]").click(function() {

          loadEntry($(this), this.value);

        });

        if (groups.length) {

          loadTasks();

        }

      });

      $('#groupsEntries').find("input[type='radio'][name=group]").click(function() {

        group = this.value;

        $('#listGroupEntries').empty();

        $. /** Load entries of selected group */
        get('api/entries/group/' + group).

        done(function(entries) {

          if (entries.length) {

            for (var i = 0; i < groups.length; i++) {

              if (groups[i]._id === group) {

                $('#listGroupEntries').
                append('<h4>' + groups[i].profile.name + ' entries</h4>');
                break;

              }
            }

            entries.forEach(function(entry) {

              $('#listGroupEntries').
              append('<input type="radio" ' +
                'name="entry" value="' + entry._id + '"/>' + entry.title + '<br>');

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

          alert(data.status + '  (' + data.statusText + ')');

        });
      });
    }).

    fail(function(data) {

      alert(data.status + '  (' + data.statusText + ')');

    });

  }

  function loadSession() {

    loadUser();
    loadTags();
    loadStatics();

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

    var email = $('#searchUserForm').find('input[name="email"]').val();
    var isContact = false;
    var i;

    $.
    post("api/search/email", $("#searchUserForm").serialize()).

    done(function(data) {

      if (user._id === data) {

        $('#usersOutput').val("That's yourself, great!");

      } else {

        $.
        get('api/contacts').

        done(function(contacts) {

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

                alert(data.status + '  (' + data.statusText + ')');

              });

            } else {

              $('#usersOutput').val("User " + data);

            }
          }

        }).

        fail(function(data) {

          alert(data.status + '  (' + data.statusText + ')');

        });
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

            alert(data.status + '  (' + data.statusText + ')');

          });

        } else {

          $('#usersOutput').val("User not found!");

        }

      } else {

        alert(data.status + '  (' + data.statusText + ')');

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

      if (data.status === 409) {

        alert('That user already exists!');

      } else {

        alert(data.status + '  (' + data.statusText + ')');

      }
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
      alert(data.status + '  (' + data.statusText + ')\n' + data.responseText);
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

      alert(data.status + '  (' + data.statusText + ')\n' + data.responseText);

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
      $('#tasksOutput').val('');
      $('#usersOutput').val('Logged in');

    }).

    fail(function(data) {

      if (data.status === 409) {
        alert(data.responseText);
      } else {
        alert(data.status + '  (' + data.statusText + ')');
      }

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

      alert(data.status + '  (' + data.statusText + ')');

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

      alert(data.status + '  (' + data.statusText + ')');

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

      alert(data.status + '  (' + data.statusText + ')');

    });

    $('#updateProfileForm')[0].reset();

  });

  /**
   * Upload profiles pictures
   */
  $("#uploadProfilePicturesForm").on('submit', function(e) {

    e.preventDefault();

    var formData = new FormData();
    var files = $("#profilePictures")[0].files;
    var file;
    var i;

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

        alert(data.status + '  (' + data.statusText + ')');

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
      $('#thisTask').empty();
      $('#thisGroup').empty();


      $('#groupsEntries').empty();
      $('#listGroups').empty();
      $('#listGroupEntries').empty();
      $('#listEntries').empty();

      $('#newEntryForm').empty();
      $('#newGroupMembers').empty();

      $('#groupsOutput').val('');
      $('#entriesOutput').val('');
      $('#tasksOutput').val('');

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

      alert(data.status + '  (' + data.statusText + ')');

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

  /**
   * Clear entries output
   */
  $('#clearTasksOutput').on('click', function() {

    $('#tasksOutput').val('');

  });

});
