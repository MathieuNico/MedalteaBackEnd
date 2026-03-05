"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PraticiensModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const praticiens_controller_1 = require("./praticiens.controller");
const praticiens_service_1 = require("./praticiens.service");
const praticien_entity_1 = require("./entities/praticien.entity");
let PraticiensModule = class PraticiensModule {
};
exports.PraticiensModule = PraticiensModule;
exports.PraticiensModule = PraticiensModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([praticien_entity_1.Praticien])],
        controllers: [praticiens_controller_1.PraticiensController],
        providers: [praticiens_service_1.PraticiensService],
        exports: [praticiens_service_1.PraticiensService],
    })
], PraticiensModule);
//# sourceMappingURL=praticiens.module.js.map