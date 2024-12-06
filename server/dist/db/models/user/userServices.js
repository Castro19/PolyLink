"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var userServices_exports = {};
__export(userServices_exports, {
  addUser: () => addUser,
  getAllUsers: () => getAllUsers,
  getUserByFirebaseId: () => getUserByFirebaseId,
  updateUser: () => updateUser
});
module.exports = __toCommonJS(userServices_exports);
var UserModel = __toESM(require("./userCollection.js"));
const addUser = async (userData) => {
  try {
    const result = await UserModel.createUser(userData);
    return { message: "User created successfully", userId: result.insertedId };
  } catch (error) {
    throw new Error("Service error: " + error.message);
  }
};
const getUserByFirebaseId = async (firebaseUserId) => {
  try {
    const user = await UserModel.findUserByFirebaseId(firebaseUserId);
    if (!user) {
      return null;
    }
    return user;
  } catch (error) {
    throw new Error("Service error: " + error.message);
  }
};
const updateUser = async (firebaseUserId, updateData) => {
  try {
    const result = await UserModel.updateUserByFirebaseId(
      firebaseUserId,
      updateData
    );
    return result;
  } catch (error) {
    throw new Error("Service error: " + error.message);
  }
};
const getAllUsers = async () => {
  try {
    const users = await UserModel.findAllUsers();
    return users;
  } catch (error) {
    throw new Error("Service error: " + error.message);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  addUser,
  getAllUsers,
  getUserByFirebaseId,
  updateUser
});