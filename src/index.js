import "./style.scss"; 

import metadata from './block.json';

import { registerBlockType } from "@wordpress/blocks";
import { __ } from "@wordpress/i18n";

import Edit from "./edit.js";
import Save from "./save.js";




// Icons should be 24x24 px
const icon = (
    <svg viewBox="0 0 24 24"
         xmlns="http://www.w3.org/2000/svg"
         aria-hidden="true"
         focusable="false">

    </svg>
);


registerBlockType(metadata.name, {
    icon: icon,
    attributes: {


        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        // Content attributes
        
        postsData: {
            type: "array",
            default: []
        },
        postsComponents: {
            type: "array",
            default: []
        },


        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        // Query attributes

        numberOfItems: {
            type: "number",
            default: 3
        },
        postTypes: {
            type: "array",
            default: []
        },
        categories: {
            type: "array",
            default: []
        },
        tags: {
            type: "array",
            default: []
        },
        postOrder: {
            type: "string",
            default: "descending" // "ascending" | "descending"
        },
        postOrderBy: {
            type: "string",
            default: "date" // "date" | "title"
        },


        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        // Formatting attributes

        thumbnailWidth: {
            type: "string",
            default: "10"
        },
        thumbnailHeight: {
            type: "string",
            default: "10"
        },
        thumbnailWidthUnits: {
            type: "string",
            default: "rem"
        },
        thumbnailHeightUnits: {
            type: "string",
            default: "rem"
        },
        showThumbnails: {
            type: "boolean",
            default: "true"
        },

        textAlignmentHorizontal: {
            type: "string",
            default: "center"
        },
        textAlignmentVertical: {
            type: "string",
            default: "flex-end"
        },
        showPostTitles: {
            type: "boolean",
            default: "true"
        },

        overflowX: {
            type: "string",
            default: "scroll"
        },
        overflowY: {
            type: "string",
            default: "hidden"
        },

        // -   -   -   -   -   -   -   -   -   -   -   -   -   -   -   -   -   -
        // Colors

        backgroundColor: {
            type: "string",
            default: "white"
        },
        titleColor: {
            type: "string",
            default: "black"
        },
        chooseTitleColor: {
            type: "boolean",
            default: "false"
        },
        emptyText: {
            type: "string",
            default: "No posts"
        },
    },

    edit: Edit,
	save: Save,
});
