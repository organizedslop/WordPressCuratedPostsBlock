/** ****************************************************************************
 *  Featured posts gutenberg block
 *  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * 
 *  v0.1
 *  by Blake (organizedSlop)
 *  
 * 
 *  TODO: Figure out a more elegant way to import Color class
 *  TODO: Fix how dev environment is detected
 *  TODO: Add options for...
 *      Only show posts with featured images
 *      Use default thumbnail for posts without featured images
 *      Only show stickied posts
 *      Toggle for update posts live or only when saving post
 *  TODO: Initialize with temp formatting while retrieving posts
 *  TODO: Remove clickable post links from editor view
 *  TODO: Fix clickable post links from frontend view
 *  TODO: Fix editor refresh bug -> there's an issue with how the postsComponents are being read into the editor from the attributes
 * 
 *  ****************************************************************************
 */


import { useEffect, useState } from "react";


import Color from "../../../../../frontend/src/components/ColorOrganizer/Color";


import axios from "axios";


import { __ } from "@wordpress/i18n";

import { InspectorControls,
         useBlockProps } from "@wordpress/block-editor";

import { __experimentalUnitControl,
         CheckboxControl,
         ColorPalette,
         __experimentalNumberControl as NumberControl,
         PanelBody,
         SelectControl,
         TextControl,
         ToggleControl } from "@wordpress/components";



/** ============================================================================
 */
export default function Edit(props) {

    /** - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
     *  WP site info
     */
    // Set API root URL based on environment
    // const apiRoot = process.env.NODE_ENV == "development" ? "" : process.env.REACT_APP_API_ROOT;
    const origin              = window.location.origin;
    const pluginRootDirectory = `${origin}/server/wp-content/plugins`;
    const apiRoot             = origin + "/server/wp-json";


    /** - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
     *  Content states
     *
     *  Posts' JSX data
     */
    const [postsData, setPostsData] = useState(props.attributes.postsData);
        
    // Posts' components to render
    const [postsComponents, setPostsComponents] = useState([]); // props.attributes.postsComponents);


    /** - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
     *  Query states
     */
    const [numberOfItems, setNumberOfItems] = useState(props.attributes.numberOfItems);
    const [allCategories, setAllCategories] = useState(props.attributes.categories);
    const [allPostTypes, setAllPostTypes]   = useState(props.attributes.postTypes);
    const [allTags, setAllTags]             = useState(props.attributes.tags);
    const [postOrder, setPostOrder]         = useState(props.attributes.postOrder);
    const [postOrderBy, setPostOrderBy]     = useState(props.attributes.postOrderBy);
    

    /** - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
     *  Formatting states
     */
    const [thumbnailWidth, setThumbnailWidth]             = useState(props.attributes.thumbnailWidth);
    const [thumbnailWidthUnits, setThumbnailWidthUnits]   = useState(props.attributes.thumbnailWidthUnits);
    const [thumbnailHeight, setThumbnailHeight]           = useState(props.attributes.thumbnailHeight);
    const [thumbnailHeightUnits, setThumbnailHeightUnits] = useState(props.attributes.thumbnailHeightUnits);
    const [showThumbnails, setShowThumbnails]             = useState(props.attributes.showThumbnails);

    const [textAlignmentHorizontal, setTextAlignmentHorizontal] = useState(props.attributes.textAlignmentHorizontal);
    const [textAlignmentVertical, setTextAlignmentVertical]     = useState(props.attributes.textAlignmentVertical);
    const [showPostTitles, setShowPostTitles]                   = useState(props.attributes.showPostTitles);

    const [overflowX, setOverflowX] = useState(props.attributes.overflowX);
    const [overflowY, setOverflowY] = useState(props.attributes.overflowY);

    const [postTitleSize, setPostTitleSize]           = useState(props.attributes.postTitleSize);
    const [postTitleSizeUnits, setPostTitleSizeUnits] = useState(props.attributes.postTitleSizeUnits);
    const [backgroundColor, setBackgroundColor]       = useState(props.attributes.backgroundColor);
    const [titleColor, setTitleColor]                 = useState(props.attributes.titleColor);
    const [chooseTitleColor, setChooseTitleColor]     = useState(props.attributes.chooseTitleColor);
    const [emptyText, setEmptyText]                   = useState(props.attributes.emptyText);


    /** ========================================================================
     *  UI components
     *  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
     * 
     *  Number of items selector component
     */
    const numberOfItemsSelector = 
        <NumberControl
            label="Maximum number of posts"
            isShiftStepEnabled={ true }
            min={ 1 }
            onChange={ (newNumberOfItemsValue) => { setNumberOfItems(parseInt(newNumberOfItemsValue)); } }
            value={ numberOfItems }
            shiftStep={ 10 }
        />;


    /** - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
     *  Order direction and order by selector component
     */
    const orderSelector =
        <SelectControl
            label="Order by"
            value={ [postOrder, postOrderBy] }
            options={ [ 
                { value: ["descending", "date" ], label: "Newest to oldest" },
                { value: ["ascending",  "date" ], label: "Oldest to newest" },
                { value: ["ascending",  "title"], label: "A → Z" },
                { value: ["descending", "title"], label: "Z → A" },
            ] }
            onChange={ (newOrderValue) => {
                setPostOrder(newOrderValue.split(",")[0]);
                setPostOrderBy(newOrderValue.split(",")[1]);
            } }
        />;


    /** - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
     *  Post type toggle components
     */
    const postTypeToggles = allPostTypes.sort().map((postType, index) => {
        return (
            <CheckboxControl
                label={ postType.name } 
                key={ postType.id }
                checked={ allPostTypes[index].isChecked } 
                onChange={ (newIsCheckedValue) => { 
                    let newAllPostTypes = allPostTypes;
                    newAllPostTypes[index].isChecked = newIsCheckedValue;
                    setAllPostTypes([...newAllPostTypes]);
                } } 
            />
        );
    });


    /** - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
     *  Tag toggle components
     */
    const tagToggles = allTags.sort().map((tag, index) => {
        return (
            <CheckboxControl
                label={ tag.name }
                key={ tag.id }
                checked={ allTags[index].isChecked }
                onChange={ (newIsCheckedValue) => {
                    let newAllTags = allTags;
                    newAllTags[index].isChecked = newIsCheckedValue;
                    setAllTags([...newAllTags]);
                } }
            />
        );
    });


    /** - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
     *  Category toggle components
     */
    const categoryToggles = allCategories.sort().map((category, index) => {
        return (
            <CheckboxControl
                label={ category.name }
                key={ category.id }
                checked={ allCategories[index].isChecked }
                onChange={ (newIsCheckedValue) => {
                    let newAllCategories = allCategories;
                    newAllCategories[index].isChecked = newIsCheckedValue;
                    setAllCategories([...newAllCategories]);
                } }
            />
        );
    });


    /** - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
     *  Inspector controls (sidebar) component
     */
    const sidebar = (
        <InspectorControls key="setting">

            { /** - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
               *  Query panel 
               */ }
            <PanelBody title="Query"
                       initialOpen={ true }>
                
                <label class="bd-curated-posts--sidebar-label">Post Types</label>
                <div class="bd-curated-posts--sidebar-scrollable-container">{ postTypeToggles }</div>

                <label class="bd-curated-posts--sidebar-label">Categories</label>
                <div class="bd-curated-posts--sidebar-scrollable-container">{ categoryToggles }</div>

                <label class="bd-curated-posts--sidebar-label">Tags</label>
                <div class="bd-curated-posts--sidebar-scrollable-container">{ tagToggles }</div>
                
                <div>{ numberOfItemsSelector }</div>
                
                <div>{ orderSelector }</div>
            </PanelBody>

            { /** - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
               *  Formatting panel 
               */ }
            <PanelBody title="Formatting"
                       initialOpen={ true }>

                <ToggleControl
                    label="Show post thumbnails"
                    checked={ showThumbnails }
                    onChange={ (newShowThumbnailsValue) => setShowThumbnails(newShowThumbnailsValue) } />

                <ToggleControl
                    label="Show post titles"
                    checked={ showPostTitles }
                    onChange={ (newShowPostTitlesValue) => setShowPostTitles(newShowPostTitlesValue) } />

                <__experimentalUnitControl
                    label="Thumbnail width"
                    onChange={ (newThumbnailWidth) => setThumbnailWidth(newThumbnailWidth) }
                    onUnitChange={ (newThumbnailWidthUnits) => setThumbnailWidthUnits(newThumbnailWidthUnits) }
                    value={ thumbnailWidth } />

                <__experimentalUnitControl
                    label="Thumbnail height"
                    onChange={ (newThumbnailHeight) => setThumbnailHeight(newThumbnailHeight) }
                    onUnitChange={ (newThumbnailHeightUnits) => setThumbnailHeightUnits(newThumbnailHeightUnits) }
                    value={ thumbnailHeight } />
                    
                <__experimentalUnitControl
                    label="Post title size"
                    onChange={ (newPostTitleSize) => setPostTitleSize(newPostTitleSize) }
                    onUnitChange={ (newPostTitleSizeUnits) => setPostTitleSizeUnits(newPostTitleSizeUnits) }
                    value={ postTitleSize } />

                <label class="bd-curated-posts--sidebar-label">Background Color</label>
                <ColorPalette
                    clearable={ true } 
                    enableAlpha={ true }
                    value={ backgroundColor }
                    onChange={ (newBackgroundColor) => setBackgroundColor(newBackgroundColor) } />
              

                <ToggleControl
                    label="Choose post title colors based on thumbnail colors"
                    checked={ !chooseTitleColor }
                    onChange={ (newChooseTitleColorValue) => setChooseTitleColor(!newChooseTitleColorValue) } />

                { (chooseTitleColor ?
                    <>
                        <label class="bd-curated-posts--sidebar-label">Post Title Color</label>
                        <ColorPalette
                            clearable={ true } 
                            enableAlpha={ true }
                            value={ titleColor }
                            onChange={ (newTitleColor) => setTitleColor(newTitleColor) } />
                    </> : "") }

                <SelectControl
                    label="Overflow"
                    value={ overflowX }
                    options={ [
                        { value: "scroll", label: "Scroll"},
                        { value: "wrap",   label: "Wrap"},
                        { value: "",       label: "Stretch"}
                    ] }
                    onChange={ (newOverflowValue) => setOverflowX(newOverflowValue) } />

                <SelectControl
                    label="Horizontal text alignment"
                    value={ textAlignmentHorizontal }
                    options={ [
                        { value: "flex-start", label: "Leading" },
                        { value: "center",     label: "Center" },
                        { value: "flex-end",   label: "Trailing" }
                    ] }
                    onChange={ (newTextAlignmentHorizontalValue) => setTextAlignmentHorizontal(newTextAlignmentHorizontalValue) } />
                               
                <SelectControl
                    label="Vertical text alignment"
                    value={ textAlignmentVertical }
                    options={ [
                        { value: "flex-start", label: "Leading" },
                        { value: "center",     label: "Center" },
                        { value: "flex-end",   label: "Trailing" }
                    ] }
                    onChange={ (newlTextAlignmentVerticalValue) => setTextAlignmentVertical(newlTextAlignmentVerticalValue) } />

                <TextControl
                    label="Empty text"
                    value={ emptyText }
                    onChange={ (newEmptyText) => setEmptyText(newEmptyText) } />

            </PanelBody>
        </InspectorControls>
    );

    

    /** ========================================================================
     *  Functions
     *  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
     * 
     *  Get queried post data from the server, and set postsData's state
     */
    async function updatePostsData() {
        console.log("Getting queried posts...");

        if (document.readyState == "complete") {
            
            let newPostsData = [];

            // Tag query
            let checkedTags = allTags.filter((tag) => tag.isChecked);
            let tagQuery = checkedTags.length > 0 && checkedTags.length != allTags.length ? `&tags=${checkedTags.map((tag) => tag.id)}` : "";

            // Category query
            let checkedCategories = allCategories.filter((category) => category.isChecked);
            let categoryQuery = checkedCategories.length > 0 && checkedCategories.length != allCategories.length ? `&categories=${checkedCategories.map((category) => category.id)}` : "";
            
            // 
            let checkedPostTypes = allPostTypes.filter((postType) => postType.isChecked);
            let requestURLs = [];
            for (const postType of checkedPostTypes) {
                let requestURL = `${apiRoot}/${postType.rest_namespace}/${postType.rest_base}?_embed&per_page=${numberOfItems}&page=1&order=${postOrder == "ascending" ? "asc" : "desc"}&orderby=${postOrderBy}`;
                
                if (postType.taxonomies.includes("category")) {
                    requestURL += categoryQuery;
                }
                if (postType.taxonomies.includes("post_tag")) {
                    requestURL += tagQuery;
                }
                requestURLs.push(requestURL);
            }

            let promises = requestURLs.map(async (url) => {
                let response = await axios.get(url);
                return response.data;
            });

            newPostsData = (await Promise.allSettled(promises))
                .map((promise) => promise.value)
                .flat()
                .sort((a, b) => {
                    if (postOrderBy === "title") {
                        return (postOrder === "ascending" ? a.title.rendered.toLowerCase() > b.title.rendered.toLowerCase() : 
                                                            a.title.rendered.toLowerCase() < b.title.rendered.toLowerCase() );
                    } else { // Default to date 
                        return (postOrder === "ascending" ? a.date < b.date :
                                                            a.date > b.date );
                    }
                });
            
            console.log("newPostsData:", newPostsData)
            console.log(newPostsData.map((postData) => `${postData.title.rendered}: ${postData.date}\n`));
                                    
            newPostsData = newPostsData.slice(0, numberOfItems);
            
            if (!arraysEqual(newPostsData, postsData)) {
                setPostsData(newPostsData);
                console.log("Finished getting queried posts:", newPostsData);
            } else {
                console.log("Finished getting queried posts (posts did not change).");
            }

        } else {
            console.warn("Attempted to get queried posts before document finished loading.")
        }
    }




    /** - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
     *  Update the rendered components
     */
    function updatePreview() {     
        const newPostsData = postsData;
        let newPostsComponents = [];

        // If new queried posts data exist
        if (newPostsData.length > 0) {
            newPostsData.forEach((post) => {
                let featuredImageURL = "";
                let featuredImageTitleColor = "#000000";
                let featuredImageMostPrevalentColor = "#FFFFFF";

                // Get the post's featured image URL if it exists
                if (post._embedded.hasOwnProperty("wp:featuredmedia")) {
                    featuredImageURL = post._embedded["wp:featuredmedia"][0].link;
                    
                    // If showing post title, determine the color for the title
                    if (showPostTitles) {
                        if (post._embedded["wp:featuredmedia"][0].most_prevalent_color) {
                            const hexValue = post._embedded["wp:featuredmedia"][0].most_prevalent_color;
                            featuredImageMostPrevalentColor = new Color(null, null, null, null, null, null, hexValue.substring(0, 6), null);
                            
                            if (featuredImageMostPrevalentColor.brightness < 0.5) {
                                featuredImageTitleColor = "#FFFFFF";
                            }
                        } else {
                            console.warn("The featured media's most prevalent color is null.")
                        }
                    }
                }

                const postTitleElement = 
                    <p  className="bd-curated-posts--title"
                        style={ {
                            color:          featuredImageTitleColor,
                            // fontSize:       postTitleSize,
                            justifyContent: textAlignmentHorizontal,
                            textShadow:     `0.05rem  0.05rem 0.1rem #${featuredImageMostPrevalentColor.hex}99, 
                                            -0.05rem  0.05rem 0.1rem #${featuredImageMostPrevalentColor.hex}99, 
                                            -0.05rem -0.05rem 0.1rem #${featuredImageMostPrevalentColor.hex}99, 
                                                0.05rem -0.05rem 0.1rem #${featuredImageMostPrevalentColor.hex}99`
                            } }>
                        { post.title.rendered }
                    </p>;

                newPostsComponents.push(
                    // element is always rendered
                    // If showing post thumbnails, the background image, position and size properties are set 
                    <a  href={ post.link }
                        className="bd-curated-posts--post"
                        key={ post.id }
                        style={ { 
                            backgroundImage:    showThumbnails ? `url(${ featuredImageURL })` : "",
                            backgroundPosition: showThumbnails ? "center" : "",
                            backgroundSize:     showThumbnails ? "cover" : "",
                            height:    thumbnailHeight,
                            maxHeight: thumbnailHeight,
                            minHeight: thumbnailHeight,
                            width:     thumbnailWidth, 
                            maxWidth:  thumbnailWidth, 
                            minWidth:  thumbnailWidth, 
                            justifyContent: textAlignmentVertical
                        } }>

                        { (showPostTitles ? postTitleElement : "") }
                    </a>
                );       
            });
        }

        // If the new post components are not the same as the previous...
        if (!arraysEqual(newPostsComponents, postsComponents)) {
            console.log("Updating preview:", newPostsComponents);

            setPostsComponents(newPostsComponents);

        // If the new components are the same as the previous...
        } else {
            console.log("Updating preview | queriedPosts objects did not change");
        }
    }
    



    /** - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
     *  Retrieve taxonomy lists 
     * 
     *  Get categories list
     */
    function getAllCategories() {
        console.log("Getting list of categories...");

        let newAllCategories = [];

        axios.get(`${apiRoot}/wp/v2/categories`)
            .then((response) => {
                newAllCategories = Object.values(response.data);

                console.log("Finished getting list of categories:", newAllCategories);
                
                if (!arraysEqual(newAllCategories, [])) {
                    for (let i = 0; i < newAllCategories.length; i++) {
                        if (!newAllCategories[i].hasOwnProperty("isChecked")) {
                            newAllCategories[i].isChecked = true;
                        }
                    }
                    setAllCategories(newAllCategories);
                }
            })
            .catch((error) => { console.error("Error getting categories", error); });
    }


    /**
     *  Get tags list
     */
    function getAllTags() {
        console.log("Getting list of tags...");

        let newAllTags = [];

        axios.get(`${apiRoot}/wp/v2/tags`)
            .then((response) => {
                newAllTags = Object.values(response.data);

                console.log("Finished getting list of tags:", newAllTags);

                if (!arraysEqual(newAllTags, [])) {
                    for (let i = 0; i < newAllTags.length; i++) {
                        if (!newAllTags[i].hasOwnProperty("isChecked")) {
                            newAllTags[i].isChecked = true;
                        }
                    }
                    setAllTags(newAllTags);
                }
            })
            .catch((error) => { console.error("Error getting tags", error); });
    }


    /**
     *  Get post type list
     */
    function getAllPostTypes() {
        console.log("Getting list of post types...");

        let newAllPostTypes = [];

        axios.get(`${apiRoot}/wp/v2/types/`)
            .then((response) => {
                newAllPostTypes = Object.values(response.data);

                
                // Filter out interally used WP post types
                newAllPostTypes = newAllPostTypes.filter((postType) => {
                    return !["menu-items", 
                             "blocks",
                             "templates", 
                             "template-parts",
                             "navigation"].includes(postType.rest_base);
                });
                
                if (!arraysEqual(newAllPostTypes, [])) {
                    for (let i = 0; i < newAllPostTypes.length; i++) {
                        if (!newAllPostTypes[i].hasOwnProperty("isChecked")) {
                            newAllPostTypes[i].isChecked = true;
                        }
                    }
                    console.log("Finished getting list of post types:", newAllPostTypes);
                    setAllPostTypes(newAllPostTypes);
                } else {
                    console.log("List of post types is empty.");
                }
            })
            .catch((error) => { console.error("Error getting post types", error); });
    }




    /** - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
     *  Update props.attributes
     */
    function updateAttributes() {
        props.setAttributes(
            {
                postsData: postsData,
                postsComponents: postsComponents,

                numberOfItems: numberOfItems,
                postTypes:     allPostTypes,
                categories:    allCategories,
                tags:          allTags,
                postOrder:     postOrder,
                postOrderBy:   postOrderBy,

                thumbnailWidth:       thumbnailWidth,
                thumbnailHeight:      thumbnailHeight,
                thumbnailWidthUnits:  thumbnailWidthUnits,
                thumbnailHeightUnits: thumbnailHeightUnits,
                showThumbnails:       showThumbnails,

                postTitleSize:           postTitleSize,
                postTitleSizeUnits:      postTitleSizeUnits,
                showPostTitles:          showPostTitles,
                chooseTitleColor:        chooseTitleColor,
                textAlignmentHorizontal: textAlignmentHorizontal,
                textAlignmentVertical:   textAlignmentVertical,

                overflowX: overflowX,
                overflowY: overflowY,

                backgroundColor: backgroundColor,
                emptyText:       emptyText,
                titleColor:      titleColor
            }
        );
    }




    /** - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
     *  Utilities
     */
    function arraysEqual(array1, array2) {

        // Return true if arrays are the same reference
        if (array1 === array2) {
            return true;
        }
        if (array1 == null || array2 == null) {
            return false;
        }
        if (array1.length !== array2.length) {
            return false;
        }

        // Sort arrays before comparing elements
        // Using shallow copy to save on performance
        const sortedArray1 = [...array1].sort();
        const sortedArray2 = [...array2].sort();

        for (var i = 0; i < array1.length; i++) {       // TODO: Confirm that ++i (rather than i++) gives correct result
            if (sortedArray1[i] !== sortedArray2[i]) {  // TODO: Add handling for cases where array contains objects/nested arrays
                return false;
            }
        }
        return true;
    }


// function objectsEqual(x, y) {
//     'use strict';

//     if (x === null || x === undefined || y === null || y === undefined) { return x === y; }
//     // after this just checking type of one would be enough
//     if (x.constructor !== y.constructor) { return false; }
//     // if they are functions, they should exactly refer to same one (because of closures)
//     if (x instanceof Function) { return x === y; }
//     // if they are regexps, they should exactly refer to same one (it is hard to better equality check on current ES)
//     if (x instanceof RegExp) { return x === y; }
//     if (x === y || x.valueOf() === y.valueOf()) { return true; }
//     if (Array.isArray(x) && x.length !== y.length) { return false; }

//     // if they are dates, they must had equal valueOf
//     if (x instanceof Date) { return false; }

//     // if they are strictly equal, they both need to be object at least
//     if (!(x instanceof Object)) { return false; }
//     if (!(y instanceof Object)) { return false; }

//     // recursive object equality check
//     var p = Object.keys(x);
//     return Object.keys(y).every(function (i) { return p.indexOf(i) !== -1; }) &&
//         p.every(function (i) { return objectsEqual(x[i], y[i]); });
// }

    


    /** ========================================================================
     *  Effects
     *  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
     * 
     *  Get taxonomy lists on app initialization
     */
    useEffect(() => {
        getAllCategories();
        getAllTags();
        getAllPostTypes();
    }, []); // Empty dependency array makes it so function is called only once on app load


    /**
     *  Update postsData when query changes
     */
    useEffect(() => { 
        updatePostsData();
    }, [allPostTypes,
        allTags,
        allCategories,
        numberOfItems,
        postOrder,
        postOrderBy]);
    

    /**
     *  Update the preview when postsData or formatting options change
     */
    useEffect(() => { 
        updatePreview(); 
    }, [postsData,
        thumbnailWidth,
        thumbnailWidthUnits,
        thumbnailHeight,
        thumbnailHeightUnits,
        showThumbnails,
        textAlignmentHorizontal,
        textAlignmentVertical,
        showPostTitles,
        overflowX,
        overflowY,
        backgroundColor,
        titleColor,
        emptyText]);


    /**
     *  Update props.attributes when the posts components (the rendered content) change
     */
    useEffect(() => {
        updateAttributes();
    }, [postsComponents]);




    /** ========================================================================
     *  Return
     *  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
     */

	return (
        <div { ...useBlockProps() } >
            <div className="bd-curated-posts">
                { sidebar }
                <link rel="stylesheet" type="text/css" href={ `${pluginRootDirectory}/curated-posts/build/style-index.css` } />
                <div className="bd-curated-posts--posts-box">
                    { (postsComponents.length > 0 ? postsComponents : 
                                                    <p>No posts</p>) }
                </div>
            </div>
        </div>
	);
}
