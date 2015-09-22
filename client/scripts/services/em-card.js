/* jshint browser: true */
/*global angular */

(function (ng) {
  'use strict';

  ng.module('App').factory('$emCard', [
    '$http',

    function ($http) {

      return {
        // Active Card I/O
        activeCard: false,
        showDetails: false,

        setCard: function (card) {
          if(card != null){
            this.activeCard = card;
          }

          return false;
        },

        getCard: function () {
          return this.activeCard;
        },

        showDetailsBar: function (bool) {
          this.showDetails = bool;
        },

        // Task Object and API Definition
        tasks: {
          config: {
            icon: "more",
            color: "#9b26af",
            span: "Tarea modificada",
            background: "lightBlue"
          },

          elementToCard: function (element) {
            var card = element;

            card.background = this.config.background;
            card.footer = element.creator && element.creator.email + ' ha creado una tarea.';
            card.color = this.config.color;
            card.icon = this.config.icon;
            card.href = '/tasks/' + element._id + '/detail';
            card.relevantDate = element.dateTime;
            card.span = element.objective || this.config.span;

            return  card;
          }

        },

        // Meeting Object and API Definition
        meetings: {
          config: {
            icon: "event_note",
            color: "#8ac248",
            span: "Nueva reunión",
            background: "green"
          },

          elementToCard: function (element) {
            var card = element;

            card.background = this.config.background;
            card.footer = element.creator && element.creator.email + ' ha agendado una reunión.';
            card.color = this.config.color;
            card.icon = this.config.icon;
            card.href = '/meetings/' + element._id + '/detail';
            card.relevantDate = element.dateTime;
            card.span = element.objective || this.config.span;

            return  card;
          }
        },

        // Groups Object and API Definition
        groups: {
          config: {
            icon: "group",
            color: "#02A8F3",
            span: "Grupo creado",
            background: "green"
          },

          elementToCard: function (element) {
            var card = element;

            card.background = this.config.background;
            card.footer = element.admin && element.admin.email + ' ha creado un grupo.';
            card.color = this.config.color;
            card.icon = this.config.icon;
            card.span = element.profile.name;
            card.relevantDate = element.created;
            card.href = '/groups/' + element._id + '/profile';

            return  card;
          }
        },

        entries: {
          audio: {
            config: {
              icon: "mic",
              color: "#00bbd3",
              span: 'Nuevo Audio',
              background: 'yellow',
              footer: ' ha creado un audio.'
            }
          },

          note: {
            config: {
              icon: "edit",
              color: "#f34235",
              span: 'Nueva Nota',
              background: 'yellow',
              footer: ' ha creado una nota.'
            }
          },

          document: {
            config: {
              icon: "insert_drive_file",
              color: "#ffc006",
              span: 'Nuevo Documento',
              background: 'yellow',
              footer: ' ha subido un documento.'
            }
          },

          image: {
            config: {
              icon: "image",
              color: "#3e50b4",
              span: 'Nueva Imagen',
              background: 'yellow',
              footer: ' ha subido una imagen.'
            }
          },

          elementToCard: function (element) {
            var card = element;
            var config;

            switch (element.type) {
              case 'audio':
                config = this.audio.config;
                break

              case 'note':
                config = this.note.config;
                break

              case 'document':
                config = this.document.config;
                break

              case 'image':
                config = this.image.config;
                break
            }

            card.background = config.background;
            card.footer = element.user && element.user.email + config.footer;
            card.color = config.color;
            card.icon = config.icon;
            card.span = element.title || config.span;
            card.relevantDate = element.updated;
            card.href = '/entries/' + element._id + '/detail';

            return  card;
          }
        }

      };

    }]);

  }(angular));
