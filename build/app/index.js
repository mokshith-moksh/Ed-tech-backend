"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initServer = void 0;
const server_1 = require("@apollo/server");
const express_1 = __importDefault(require("express"));
const express4_1 = require("@apollo/server/express4");
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const user_1 = require("./user");
const courses_1 = require("./courses");
const section_1 = require("./section");
const subSection_1 = require("./subSection");
const coureProgress_1 = require("./coureProgress");
const category_1 = require("./category");
const profile_1 = require("./profile");
const RatingAndReview_1 = require("./RatingAndReview");
const resetPassword_1 = require("./resetPassword");
const auth_1 = require("../middleware/auth");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const payment_1 = require("./payment");
function initServer() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = (0, express_1.default)();
        const graphqlServer = new server_1.ApolloServer({
            typeDefs: `
     ${user_1.User.types}
     ${courses_1.Courses.types}
     ${section_1.Section.types}
     ${subSection_1.subSection.types}
     ${coureProgress_1.CourseProgress.types}
     ${category_1.Category.types}
     ${profile_1.Profile.types}
     ${RatingAndReview_1.RatingAndReviews.types}
     ${resetPassword_1.ResetPassword.types}
     ${payment_1.Payment.types}
    
      type Query{
      ${user_1.User.queries}
      ${subSection_1.subSection.queries}
      ${courses_1.Courses.queries}
      ${category_1.Category.queries}
      ${profile_1.Profile.queries}
      ${RatingAndReview_1.RatingAndReviews.queries}
      }
      type Mutation{
        ${user_1.User.mutations}
        ${resetPassword_1.ResetPassword.mutations}
        ${section_1.Section.mutations}
        ${courses_1.Courses.mutations}
        ${payment_1.Payment.mutations}
        ${category_1.Category.mutations}
        ${profile_1.Profile.mutations}
        ${subSection_1.subSection.mutations}
        ${coureProgress_1.CourseProgress.mutations}
        ${RatingAndReview_1.RatingAndReviews.mutations}
      }
    `,
            resolvers: {
                Query: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, subSection_1.subSection.resolvers.queries), courses_1.Courses.resolvers.queries), category_1.Category.resolvers.queries), profile_1.Profile.resolvers.queries), RatingAndReview_1.RatingAndReviews.resolvers.queries),
                Mutation: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, user_1.User.resolvers.mutations), resetPassword_1.ResetPassword.resolvers.mutations), section_1.Section.resolvers.mutations), courses_1.Courses.resolvers.mutations), payment_1.Payment.resolvers.mutations), category_1.Category.resolvers.mutations), profile_1.Profile.resolvers.mutations), subSection_1.subSection.resolvers.mutations), coureProgress_1.CourseProgress.resolvers.mutations), RatingAndReview_1.RatingAndReviews.resolvers.mutations),
                //extraresolver
            },
        });
        yield graphqlServer.start();
        app.use((0, cors_1.default)());
        app.use(body_parser_1.default.json());
        app.use((0, cookie_parser_1.default)());
        app.use("/graphql", (0, express4_1.expressMiddleware)(graphqlServer, {
            context: ({ req, res }) => __awaiter(this, void 0, void 0, function* () {
                const decodedUser = yield (0, auth_1.auth)(req);
                const isStudentAuth = yield (0, auth_1.isStudent)(decodedUser);
                const isInstructorAuth = yield (0, auth_1.isInstructor)(decodedUser);
                const isAdminAuth = yield (0, auth_1.isAdmin)(decodedUser);
                return {
                    DecodedUser: decodedUser,
                    IsStudent: isStudentAuth,
                    IsInstructor: isInstructorAuth,
                    IsAdminAuth: isAdminAuth,
                    res
                };
            }),
        }));
        return app;
    });
}
exports.initServer = initServer;
