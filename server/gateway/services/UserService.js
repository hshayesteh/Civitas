'use strict';

var AppUtil = require('../../libs/AppUtil');
var Logging = require('../utilities/Logging');
var config = require('config');
var _ = require('lodash');
var PubSub = require('../../libs/PubSub/PubSubAdapter');
var Message = require('../../libs/PubSub/Message');
var constants = require('../../Constants');
var PubSubChannels = require('../../PubSubChannels');

/**
 * The User Service module
 */
module.exports = {
  
  /**
   * Creates note
   *
   * @param {object} args - The request arguments passed in from the controller
   * @param {IncomingMessage} response - The http response object
   * @param {function} next - The callback used to pass control to the next action/middleware
   */
  createUser: function(args, response, next) {

    var noteRequest = args.user.value;

    var request = new Message(
      PubSubChannels.User.External.Event,
      constants.pub_sub.message_type.crud,
      constants.pub_sub.message_action.create,
      noteRequest
    );

    PubSub
      .publish(request, "UserEvent")
      .subscribe("UserCompletedEvent", { unsubscribe: true }, function handleCompleted(err, completed) {
        if (err) {
          return next(err);
        }
        response.statusCode = completed.payload.statusCode;
        response.setHeader('Content-Type', 'application/json');
        return response.end(JSON.stringify(completed.payload.body));
      });
  },
  
  // /**
  //  * Deletes note
  //  *
  //  * @param {object} args - The request arguments passed in from the controller
  //  * @param {IncomingMessage} response - The http response object
  //  * @param {function} next - The callback used to pass control to the next action/middleware
  //  */
  // deleteUser: function(args, response, next) {
  //   // Make sure that the no other note with the same title exist already
  //
  //   Note.findById(args.id.value, function noteFindOneCallback(err, note) {
  //       if (err) {
  //         return next(err);
  //       }
  //
  //       if (AppUtil.isNullOrUndefined(note)) {
  //         var modelValidationError = new ValidationError(
  //           'Some validation errors occurred.',
  //           [
  //             {
  //               code: ErrorCodes.NOTE_WAS_NOT_FOUND,
  //               message: 'A note with the id [' + args.id.value + '] could not be found.',
  //               path: ['id']
  //             }
  //           ]
  //         );
  //         return next(modelValidationError);
  //       }
  //
  //       Logging.logAction(
  //         Logging.logLevels.INFO,
  //         'Attempting to remove a note document'
  //       );
  //
  //       note.remove(
  //         function noteRemoveCallback(err) {
  //           if (err) {
  //             return next(err);
  //           }
  //
  //           // we do not want to return this prop
  //           response.statusCode = 200;
  //           response.setHeader('Content-Type', 'application/json');
  //           response.end(JSON.stringify(note));
  //         }
  //       );
  //     }
  //   );
  // },
  //
  // /**
  //  * Returns a note
  //  *
  //  * @param {object} args - The request arguments passed in from the controller
  //  * @param {IncomingMessage} response - The http response object
  //  * @param {function} next - The callback used to pass control to the next action/middleware
  //  */
  // getSingleUser: function(args, response, next) {
  //
  //   Logging.logAction(
  //     Logging.logLevels.INFO,
  //     'Attempting to get a note document'
  //   );
  //
  //   Note.findById(args.id.value, function noteFindOneCallback(err, note) {
  //       if (err) {
  //         return next(err);
  //       }
  //
  //       if (AppUtil.isNullOrUndefined(note)) {
  //         var notFoundError = new ResourceNotFoundError(
  //           'Resource not found.',
  //           'No note with id [' + args.id.value + '] could be found'
  //         );
  //         return next(notFoundError);
  //       }
  //
  //     // we do not want to return this prop
  //     response.statusCode = 200;
  //     response.setHeader('Content-Type', 'application/json');
  //     response.end(JSON.stringify(note));
  //
  //     }
  //   );
  // },
  //
  // /**
  //  * Returns a note
  //  *
  //  * @param {object} args - The request arguments passed in from the controller
  //  * @param {IncomingMessage} response - The http response object
  //  * @param {function} next - The callback used to pass control to the next action/middleware
  //  */
  // updateUser: function(args, response, next) {
  //
  //   var noteRequest = args.note.value;
  //
  //   Note.findById(args.id.value, function noteFindOneCallback(err, note) {
  //       if (err) {
  //         return next(err);
  //       }
  //
  //       if (AppUtil.isNullOrUndefined(note)) {
  //         var notFoundError = new ResourceNotFoundError(
  //           'Resource not found.',
  //           'No note with id [' + args.id.value + '] could be found'
  //         );
  //         return next(notFoundError);
  //       }
  //
  //     // TODO consider doing this in parallel
  //     Note.findOne({ title: noteRequest.title }, function noteFindOneCallback(err, noteTitleCheck) {
  //         if (err) {
  //           next(err);
  //           return;
  //         }
  //
  //         if (!AppUtil.isNullOrUndefined(noteTitleCheck) && (String(note._id) != String(noteTitleCheck._id))) {
  //           var modelValidationError = new ValidationError(
  //             'Some validation errors occurred.',
  //             [
  //               {
  //                 code: ErrorCodes.TITLE_ALREADY_EXISTS,
  //                 message: 'A note with the title [' + noteRequest.title + '] already exists.',
  //                 path: ['title']
  //               }
  //             ]
  //           );
  //           return next(modelValidationError);
  //         }
  //
  //         Logging.logAction(
  //           Logging.logLevels.INFO,
  //           'Attempting to update a note document'
  //         );
  //
  //         // set the updated properties, mongoose does not behave correctly if you pass a model directly
  //         var updatedProperties = {
  //           title: noteRequest.title,
  //           bgColor: noteRequest.bgColor,
  //           items: noteRequest.items
  //         };
  //
  //         Note.update( {_id : note._id}, updatedProperties, function noteUpdateCallback(err) {
  //             if (err) {
  //               return next(err);
  //             }
  //
  //             response.statusCode = 200;
  //             response.setHeader('Content-Type', 'application/json');
  //
  //             note.title = noteRequest.title;
  //             note.bgColor = noteRequest.bgColor;
  //             note.items = noteRequest.items;
  //             note.updatedAt = Date.Now;
  //
  //             return response.end(JSON.stringify(note));
  //           }
  //         );
  //       });
  //     }
  //   );
  // },
  //
  // /**
  //  * Returns all notes
  //  *
  //  * @param {object} args - The request arguments passed in from the controller
  //  * @param {IncomingMessage} res - The http response object
  //  * @param {function} next - The callback used to pass control to the next action/middleware
  //  */
  // getAllUsers: function(args, res, next) {
  //
  //   Logging.logAction(
  //     Logging.logLevels.INFO,
  //     'Attempting to retrieve all notes'
  //   );
  //
  //   Note.find(
  //     {},
  //     function noteFindCallback(err, notes) {
  //       if (err) {
  //         next(err);
  //         return;
  //       }
  //
  //       // If the array is empty we need to return a 204 response.
  //       if (AppUtil.isArrayEmpty(notes)) {
  //         res.statusCode = 204;
  //         res.setHeader('Content-Type', 'application/json');
  //         res.setHeader('X-Result-Count', 0);
  //         res.end(null);
  //       } else {
  //         res.statusCode = 200;
  //         res.setHeader('Content-Type', 'application/json');
  //         res.setHeader('X-Result-Count', notes.length);
  //         res.end(JSON.stringify(notes));
  //       }
  //     }
  //   );
  // }
};