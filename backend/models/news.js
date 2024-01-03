const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newsSchema = new Schema(
    {
        provider_article_id: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        link: {
            type: String,
            required: true
        },
        author: {
            type: String,
            default: "Author not found"
        },         
        content: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true 
        },
        pubDate: {
            type: Date,
            required: true
        },
        image_url:{
            type: String,
            required: true 
        },
        category:{
            type: String,
            required: true 
        },
        avatar:{
            type: String,
            required: true 
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('News', newsSchema);
