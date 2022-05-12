const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)
module.exports.tvSchema=Joi.object(
    {
        image:Joi.object(
            {
                medium:Joi.string().required().escapeHTML(),
                original:Joi.string().escapeHTML()
            }
        ).required(),
        name:Joi.string().required().escapeHTML()
    }
).required();
module.exports.reviewSchema=Joi.object({
    rating:Joi.number().min(0.1).max(10),
    review:Joi.string().required().escapeHTML()
}).required()