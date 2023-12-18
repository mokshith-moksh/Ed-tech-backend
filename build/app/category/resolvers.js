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
const categoryResponse = {
    success: false,
    message: "",
    category: {}
};
const queries = {
    showAllCategories: (parent, _, context) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const allCategories = yield db_1.prismaClient.category.findMany();
            return {
                allCategories
            };
        }
        catch (error) {
            console.error("Error while fetching all categories:", error);
            categoryResponse.message = "error while fetching all category";
            return categoryResponse;
        }
    }),
    categoryPageDetails: (parent, { categoryId }, context) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const selectedCategory = yield db_1.prismaClient.category.findUnique({
                where: {
                    id: categoryId
                },
                include: {
                    courses: {
                        where: {
                            status: "Published"
                        },
                        include: {
                            courseProgress: true
                        }
                    }
                }
            });
            if (!selectedCategory) {
                categoryResponse.message = "No category selected";
                return categoryResponse;
            }
            if (selectedCategory.courses.length === 0) {
                categoryResponse.message = "No courses found in selected category";
                return categoryResponse;
            }
            const categoriesExceptSelected = yield db_1.prismaClient.category.findMany({
                where: { id: { not: categoryId } },
            });
            const differentCategory = yield db_1.prismaClient.category.findUnique({
                where: {
                    id: categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)].id,
                },
                include: {
                    courses: {
                        where: { status: "Published" },
                    },
                },
            });
            //top selling courses, most selling courses 
            const allCategories = yield db_1.prismaClient.category.findMany({
                include: {
                    courses: {
                        where: { status: "Published" },
                    },
                },
            });
            const allCourses = allCategories.flatMap((category) => category.courses);
            const mostSellingCourses = allCourses
                .sort((a, b) => b.sold - a.sold)
                .slice(0, 10);
            return {
                selectedCategory,
                differentCategory,
                mostSellingCourses
            };
        }
        catch (error) {
            categoryResponse.message = "error while crating categoryPageDetails";
            return categoryResponse;
        }
    }),
};
const mutations = {
    createCategory: (parent, { name, description }, context) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const CategoryDeatils = yield db_1.prismaClient.category.create({
                data: {
                    name,
                    description
                }
            });
            categoryResponse.message = "Category added successfully";
            return categoryResponse;
        }
        catch (error) {
            console.log(error);
            categoryResponse.message = "unable create Category";
            return categoryResponse;
        }
    })
};
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
exports.resolvers = { mutations, queries };
