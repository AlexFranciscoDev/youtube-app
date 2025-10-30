const express = require("express");
const {Schema, model} = require("mongoose");

const CategorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

/**
 * Campos y consideraciones recomendadas para Category:

* name (string, required, único)
* description (opcional)
* image (opcional, referencia a almacenamiento)
* active / deletedAt (para soft-delete)
* createdAt, updatedAt (timestamps)
Endpoints mínimos para Category:

==> create (validar name/slug)
==> list (paginación, filtro active, búsqueda por name)
==> get (por id o slug)
==> update (no permitir duplicar slugs)
==> delete (recomiendo soft-delete; documentar comportamiento futuro en cascada)
    
    Qué preparar para cuando implementes Video después:

Decidir si Video almacenará una referencia simple a Category (ObjectId) o un array de categorías.
Cómo manejar categorías eliminadas (reasignar, marcar video como sin categoría, impedir eliminación si hay videos).
Plan para búsquedas y filtros por category.slug (indexar).
 */

module.exports = model("Category", CategorySchema);