"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const types_1 = require("./types"); //type of data
const query_1 = require("./query"); //type of data
const mutations_1 = require("./mutations");
const resolvers_1 = require("./resolvers");
exports.User = { types: types_1.types, queries: query_1.queries, mutations: mutations_1.mutations, resolvers: resolvers_1.resolvers };
