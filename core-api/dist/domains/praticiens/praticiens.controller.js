"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PraticiensController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const praticiens_service_1 = require("./praticiens.service");
const create_praticien_dto_1 = require("./dto/create-praticien.dto");
const update_praticien_dto_1 = require("./dto/update-praticien.dto");
let PraticiensController = class PraticiensController {
    praticiensService;
    constructor(praticiensService) {
        this.praticiensService = praticiensService;
    }
    create(createPraticienDto) {
        return this.praticiensService.create(createPraticienDto);
    }
    findAll() {
        return this.praticiensService.findAll();
    }
    findOne(id) {
        return this.praticiensService.findOne(id);
    }
    update(id, updatePraticienDto) {
        return this.praticiensService.update(id, updatePraticienDto);
    }
    remove(id) {
        return this.praticiensService.remove(id);
    }
};
exports.PraticiensController = PraticiensController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_praticien_dto_1.CreatePraticienDto]),
    __metadata("design:returntype", Promise)
], PraticiensController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PraticiensController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PraticiensController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_praticien_dto_1.UpdatePraticienDto]),
    __metadata("design:returntype", Promise)
], PraticiensController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PraticiensController.prototype, "remove", null);
exports.PraticiensController = PraticiensController = __decorate([
    (0, swagger_1.ApiTags)('Praticiens'),
    (0, common_1.Controller)('praticiens'),
    __metadata("design:paramtypes", [praticiens_service_1.PraticiensService])
], PraticiensController);
//# sourceMappingURL=praticiens.controller.js.map