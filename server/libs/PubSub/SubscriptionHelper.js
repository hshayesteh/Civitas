var constants = require('../../Constants');
var Message = require('../../libs/PubSub/Message');
var pubSub = require('../../libs/PubSub/PubSubAdapter');
var internalEventEmitter = require('../../libs/InternalEventEmitter');

/**
 * Emits the passed message as an internal CRUD events
 *
 * @param {object} message - The message that will be emitted
 * @param {string} channelDetails - Contains the external channelDetails details
 */
function emitCRUDEvents(message, channelDetails) {

  internalEventEmitter.on(channelDetails.Internal.CreateCompletedEvent, function(response){
    _sendCrudCompleted(message, response, channelDetails, constants.pubSub.messageAction.create);
  });

  internalEventEmitter.on(channelDetails.Internal.UpdateCompletedEvent, function(response) {
    _sendCrudCompleted(message, response, channelDetails, constants.pubSub.messageAction.update);
  });

  internalEventEmitter.on(channelDetails.Internal.DeleteCompletedEvent, function(response){
    _sendCrudCompleted(message, response, channelDetails, constants.pubSub.messageAction.delete);
  });

  internalEventEmitter.on(channelDetails.Internal.GetSingleCompletedEvent, function(response){
    _sendCrudCompleted(message, response, channelDetails, constants.pubSub.messageAction.getSingle);
  });

  internalEventEmitter.on(channelDetails.Internal.GetAllCompletedEvent, function(response){
    _sendCrudCompleted(message, response, channelDetails, constants.pubSub.messageAction.getAll);
  });

  switch (message.action) {
    case constants.pubSub.messageAction.create:
      internalEventEmitter.emit(channelDetails.Internal.CreateEvent, message.payload);
      break;
    case constants.pubSub.messageAction.update:
      internalEventEmitter.emit(channelDetails.Internal.UpdateEvent, message.payload);
      break;
    case constants.pubSub.messageAction.delete:
      internalEventEmitter.emit(channelDetails.Internal.DeleteEvent, message.payload);
      break;
    case constants.pubSub.messageAction.getSingle:
      internalEventEmitter.emit(channelDetails.Internal.GetSingleEvent, message.payload);
      break;
    case constants.pubSub.messageAction.getAll:
      internalEventEmitter.emit(channelDetails.Internal.GetAllEvent, message.payload);
      break;
    default:
      console.error(`Type [${message.type}] is not supported`)
  }
}

/**
 * Publishes an external CRUD completed event
 *
 * @param {object} request - The original CRUD request object
 * @param {object} response - The CRUD response object
 * @param {string} channelDetails - Contains the external channelDetails details
 * @param {string} action - The CRUD action that was specified on the request
 *
 * @private
 */
function _sendCrudCompleted(request, response, channelDetails, action) {

  // pass the same messageId that was set on the request so that the gateway can map the completed event back to 
  // the original event
  var completedResponse = new Message(
    channelDetails.External.CompletedEvent,
    constants.pubSub.messageType.crud,
    action,
    response,
    request.header.messageId 
  );

  pubSub.publish(completedResponse, channelDetails.External.CompletedEvent);
  _removeAllCRUDListeners(channelDetails);
}

/**
 * Removed the internal event listeners
 *
 * @param {string} channelDetails - Contains the external channelDetails details
 *
 * @private
 */
function _removeAllCRUDListeners(channelDetails) {
  internalEventEmitter.removeAllListeners(channelDetails.Internal.CreateCompletedEvent);
  internalEventEmitter.removeAllListeners(channelDetails.Internal.UpdateCompletedEvent);
  internalEventEmitter.removeAllListeners(channelDetails.Internal.DeleteCompletedEvent);
  internalEventEmitter.removeAllListeners(channelDetails.Internal.GetSingleCompletedEvent);
  internalEventEmitter.removeAllListeners(channelDetails.Internal.GetAllCompletedEvent);
}

module.exports = {
  emitCRUDEvents: emitCRUDEvents
};
