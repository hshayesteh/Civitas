'use strict';

var userService = require('../services/UserService');
var internalEventEmitter = require('../../libs/InternalEventEmitter');
var userChannels = require('../../PubSubChannels').User;

/**
 * Calls the corresponding service layer method to create a user
 */
internalEventEmitter.on(userChannels.Internal.CreateEvent, function(event){
  userService.createUser(event);
});

/**
 * Calls the corresponding service layer method to get all users
 */
internalEventEmitter.on(userChannels.Internal.GetAllEvent, function(event){
  userService.getAllUsers(event);
});

/**
 * Calls the corresponding service layer method to get a single user
 */
internalEventEmitter.on(userChannels.Internal.GetSingleEvent, function(event){
  userService.getSingleUser(event);
});

/**
 * Calls the corresponding service layer method to delete a user
 */
internalEventEmitter.on(userChannels.Internal.DeleteEvent, function(event){
  userService.deleteUser(event);
});

/**
 * Calls the corresponding service layer method to update a user
 */
internalEventEmitter.on(userChannels.Internal.UpdateEvent, function(event){
  userService.updateUser(event);
});
