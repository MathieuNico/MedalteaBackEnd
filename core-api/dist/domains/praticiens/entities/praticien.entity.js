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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Praticien = void 0;
const typeorm_1 = require("typeorm");
let Praticien = class Praticien {
    id;
    lastName;
    firstName;
    address;
    country;
    mail;
    city;
    postalCode;
    phoneNumber;
    schedules;
    price;
};
exports.Praticien = Praticien;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Praticien.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_name', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Praticien.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'first_name', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Praticien.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Praticien.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Praticien.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Praticien.prototype, "mail", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Praticien.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'postal_code', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Praticien.prototype, "postalCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'phone_number', type: 'varchar', length: 15, nullable: true }),
    __metadata("design:type", String)
], Praticien.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Praticien.prototype, "schedules", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Praticien.prototype, "price", void 0);
exports.Praticien = Praticien = __decorate([
    (0, typeorm_1.Entity)('praticiens')
], Praticien);
//# sourceMappingURL=praticien.entity.js.map