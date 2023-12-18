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
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const db_1 = require("../../client/db");
const response = {
    sucess: false,
    message: "",
    Section: {}
};
const mutations = {
    createSection: (parent, { sectionName, courseId }, context) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!sectionName || !courseId) {
                response.message = "Sectionname and courseId are required";
                return response;
            }
            const newSection = yield db_1.prismaClient.section.create({
                data: {
                    sectionName: sectionName,
                    course: {
                        connect: {
                            id: courseId
                        }
                    }
                }
            });
            response.sucess = true;
            response.message = "section updated successfully";
            return response;
        }
        catch (error) {
            console.log(error);
            response.message = "sectionName updating problem";
            return response;
        }
    }),
    updateSection: (parent, { sectionName, sectionId }, context) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const section = yield db_1.prismaClient.section.update({
                where: {
                    id: sectionId
                },
                data: {
                    sectionName: sectionName
                }
            });
            response.message = "section updated successfully";
            response.sucess = true;
            response.Section = section;
            return response;
        }
        catch (error) {
            console.log(error);
            response.message = "sectionName updating problem";
            return response;
        }
    }),
    deleteSection: (parent, { sectionId, courseId }, context) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield db_1.prismaClient.section.delete({
                where: {
                    id: sectionId
                }
            });
            response.message = "section deleted";
            response.sucess = true;
            return response;
        }
        catch (error) {
            console.log(error);
            response.message = "Error while deleting";
            return response;
        }
    })
};
exports.resolvers = { mutations };
