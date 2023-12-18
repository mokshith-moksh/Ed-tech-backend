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
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const db_1 = require("../../client/db");
const response = {
    sucess: false,
    message: "",
    subSections: {}
};
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_DEFAULT_REGION,
});
const queries = {
    getSignedURLForVideos: (parent, { videoName, videoType }, context) => __awaiter(void 0, void 0, void 0, function* () {
        if (!context.IsInstructor) {
            throw new Error("Unauthorized access to videoupload alert send to admin...");
        }
        const allowedVideoTypes = ["video/mp4", "video/webm", "video/quicktime"];
        if (!allowedVideoTypes.includes(videoType)) {
            throw new Error("Unsupported Video Type");
        }
        const putObjectCommand = new client_s3_1.PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            ContentType: videoType,
            Key: `uploads/${context.DecodedUser.id}/videos/${videoName}-${Date.now()}`,
        });
        const signedURL = yield (0, s3_request_presigner_1.getSignedUrl)(s3Client, putObjectCommand);
        return signedURL;
    })
};
const mutations = {
    createSubSection: (parent, { title, timeDuration, desciption, SectionId, signedURL }, context) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!title || !timeDuration || !desciption || !SectionId) {
                response.message = "all credentials required";
                return response;
            }
            console.log("creating new section");
            const uploadedVideos = yield db_1.prismaClient.subSection.create({
                data: {
                    subsection: {
                        connect: {
                            id: SectionId
                        }
                    },
                    title,
                    timeDuration,
                    description: desciption,
                    videoUrl: signedURL,
                }
            });
            response.message = "uploaded Done!!!";
            response.sucess = true;
            response.subSections = uploadedVideos;
            return response;
        }
        catch (error) {
            console.log(error);
            response.message = "not uploaded";
            return response;
        }
    }),
    updateSubSection: (parent, { subSectionId, title, description, signedURL, timeDuration }, context) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const subSection = yield db_1.prismaClient.subSection.findUnique({ where: { id: subSectionId } });
            if (!subSection) {
                response.message = "subSection Id is wrong || subSection is not found";
                return response;
            }
            if (title !== undefined) {
                subSection.title = title;
            }
            if (description !== undefined) {
                subSection.description = description;
            }
            if (timeDuration !== undefined && signedURL !== undefined) {
                subSection.timeDuration = timeDuration;
                subSection.videoUrl = signedURL;
            }
            const updatedSubSection = yield db_1.prismaClient.subSection.update({
                where: { id: subSectionId },
                data: subSection,
            });
            response.message = "subSection updated successfully";
            response.sucess = true;
            response.subSections = updatedSubSection;
            return response;
        }
        catch (error) {
            console.error("Error updating subsection", error);
            response.message = "Error updating subsection";
            return response;
        }
    }),
    deleteSubSection: (parent, { subSectionId }, context) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const deletedSubSection = yield db_1.prismaClient.subSection.delete({
                where: {
                    id: subSectionId
                }
            });
            response.message = "deleted successfully";
            response.sucess = true;
            response.subSections = deletedSubSection;
            return response;
        }
        catch (error) {
            console.error("Error deleteSubSection", error);
            response.message = "Error deleteSubSection";
            return response;
        }
    })
};
exports.resolvers = { mutations, queries };
