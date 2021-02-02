const express = require("express");
// Connect to mongo
const monk = require("monk");
// Schema Validator
const joi = require("@hapi/joi");

// Connect to Mongo DB
const db = monk(process.env.MONGO_URI);
// connect to collection
const faqs = db.get("faqs");

// Validate incoming faqs data through joi schema
const schema = joi.object({
    question: joi.string().trim().required(),
    answer: joi.string().trim().required(),
    vote_count: joi.number().integer().default(0),
    user_id: joi.string().trim().required(),
});

const router = express.Router();

// Get all faqs in database
router.get("/", async (req, res, next) => {
    try {
        // search database for all avaliable faqs
        const items = await faqs.find({});
        // send them to user
        res.json(items);
    } catch (error) {
        next(error);
    }
});

// Get one faq in database
router.get("/:id", async (req, res, next) => {
    try {
        // grab id from url
        const {
            id
        } = req.params;
        // find one faq which matches this id
        const faq = await faqs.findOne({
            _id: id,
        });
        // check for valid faq in db
        if (!faq) return next();
        return res.json(faq);
    } catch (error) {
        // if error throw it
        next(error);
    }
});

// Insert a faq
router.post("/", async (req, res, next) => {
    try {
        // check if faq has a question and an answer
        const valid = await schema.validateAsync(req.body);
        // insert it to database
        const inserted = await faqs.insert(valid);
        // return it to user
        res.json(inserted);
    } catch (error) {
        // if error throw it
        next(error);
    }
});

// Update a faq
router.put("/:id", async (req, res, next) => {
    try {
        // grab id from url
        const {
            id
        } = req.params;
        // validate faq
        const valid = await schema.validateAsync(req.body);
        // search database for this faq and update it
        const faq = await faqs.findOneAndUpdate({
            _id: id
        }, {
            $set: valid
        });
        // if we don't get any response, throw error
        if (!faq) return next();
        // return updated faq to user
        res.json(faq);
    } catch (error) {
        // if error throw it
        next(error);
    }
});

// Delete one faq
router.delete("/:id", async (req, res, next) => {
    try {
        // get id from url
        const {
            id
        } = req.params;
        // find this faq and delete it
        await faqs.findOneAndDelete({
            _id: id,
        });
        // tell user that this faq was deleted
        res.json({
            message: "Successfully deleted",
        })
    } catch (error) {
        // if error throw it
        next(error);
    }
});

// Delete all faqs
router.delete("/", async (req, res, next) => {
    try {
        // find all faqs and delete them
        // TODO : GET FAQS BY USER ID
        await faqs.remove({});
        // tell user that this faq was deleted
        res.json({
            message: "Successfully deleted all faqs",
        })
    } catch (error) {
        // if error throw it
        next(error);
    }
});
module.exports = router;
