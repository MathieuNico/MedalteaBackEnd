"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePraticienDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_praticien_dto_1 = require("./create-praticien.dto");
class UpdatePraticienDto extends (0, swagger_1.PartialType)(create_praticien_dto_1.CreatePraticienDto) {
}
exports.UpdatePraticienDto = UpdatePraticienDto;
//# sourceMappingURL=update-praticien.dto.js.map