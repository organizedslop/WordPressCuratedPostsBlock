import { getInnerContainerHTML, getItemHTML, getItemInfoHTML } from "./rlb-collection-render.js";

(function() {

    var el = wp.element.createElement;

    const apiFetch = wp.apiFetch;

    const {
        InspectorControls,
        RichText
    } = wp.blockEditor;

    const {
        __experimentalUnitControl,
        CheckboxControl,
        ColorPalette,
        PanelBody,
        QueryControls,
        SelectControl,
        TextControl,
        ToggleControl
    } = wp.components;


    let previewItems = [];
    let categories = {};



    const blockConfig = {
        apiVersion: 2,
        title: 'Collection',
        icon: 'columns',
        category: 'media',
        attributes: {

            // Block ID -----------------------------------
            blockId: {
                type: 'string'
            },

            // Content Attributes -------------------------
            media: {
                type: "string",
                default: ""
            },

            // Placeholder Attributes ---------------------
            placeholderHeight: {
                type: "string",
                default: ""
            },
            placeholderWidth: {
                type: "string",
                default: ""
            },
            placeholderMargin: {
                type: "string",
                default: ""
            },

            // Query Attributes ---------------------------
            filterCategory: {
                type: 'array',
                default: []
            },
            filterDate: {
                type: 'string'  // 'upcoming' | 'past' | ''
            },

            order: {
                type: 'string',
                default: 'desc'  // 'asc' | 'desc'
            },
            orderBy: {
                type: 'string',
                default: 'date'  // 'date' | 'title'
            },

            showAwards: {
                type: 'boolean',
                default: false
            },
            showEvents: {
                type: 'boolean',
                default: false
            },
            showMentions: {
                type: 'boolean',
                default: false
            },
            showPosts: {
                type: 'boolean',
                default: true
            },
            showProducts: {
                type: 'boolean',
                default: false
            },
            showReviews: {
                type: 'boolean',
                default: false
            },


            // Formatting Attributes ----------------------
            backgroundColor: {
                type:    "string",
                default: ""
            },
            textColor: {
                type:    "string",
                default: ""
            },
            titleColor: {
                type:    "string",
                default: ""
            },

            emptyText: {
                type: 'string',
                default: 'There is no content for this collection.'
            },

            imageSize: {
                type: 'string',
                default: '300px'
            },
            imageUnits: {
                type: 'string',
                default: 'px'
            },
            showImages: {
                type: 'boolean',
                default: true,
            },
            scaleImages: {
                type: "boolean",
                default: false,
            },
            overflow: {
                type: 'string',
                default: 'wrap',
            },
            showInfo: {
                type: 'boolean',
                default: true
            },
            showDescriptions: {
                type: 'boolean',
                default: false
            },
            headingText: {
                type: 'string'
            },
            maxCount: {
                type: 'number',
                default: 3
            },

        }, // end attributes


        // --------------------------------------------------------------------
        // Edit
        // --------------------------------------------------------------------
        edit(props) {
            props.setAttributes({ blockId: "block-" + props.clientId });

            const colorPalette = [{ name: "white",        color: "#ffffff"},
                                  { name: "grey",         color: "#c5c5c5"},
                                  { name: "black",        color: "#000000"},
                                  { name: "red",          color: "#ff0000"},
                                  { name: "orange",       color: "#ffa600"},
                                  { name: "yellow",       color: "#ffdd00"},
                                  { name: "yellowgreen",  color: "#ddff00"},
                                  { name: "green",        color: "#8cff00"},
                                  { name: "teal",         color: "#00ffc4"},
                                  { name: "blue",         color: "#0080ff"},
                                  { name: "purple",       color: "#7b00ff"},
                                  { name: "magenta",      color: "#ff00f2"}];

            // Initialize category suggestions
            var categorySuggestions = {};

            function updateQuery() {
                // console.log("updateQuery");

                apiFetch({ path: 'rodney-lee-brands/rlb-collection/items',
                           method: 'POST',
                           data: { filterCategory: Object.values(Object.values(props.attributes.filterCategory)).map(x => x['id']),
                                   filterDate:     props.attributes.filterDate,

                                   order:          props.attributes.order,
                                   orderBy:        props.attributes.orderBy,

                                   showAwards:     props.attributes.showAwards,
                                   showEvents:     props.attributes.showEvents,
                                   showMentions:   props.attributes.showMentions,
                                   showPosts:      props.attributes.showPosts,
                                   showProducts:   props.attributes.showProducts,
                                   showReviews:    props.attributes.showReviews
                           }
                }).then((items) => {
                    // console.log(items);
                    previewItems = items.html;

                    props.setAttributes({
                        media: JSON.stringify(previewItems)
                    });

                    updateFormatting();

                    for (let i in items.categories) {
                        categories[items.categories[i]['cat_name']] =
                        {
                            id:     items.categories[i]['term_id'],
                            name:   items.categories[i]['name'],
                            parent: items.categories[i]['parent']
                        }
                    }
                    console.log(items.categories);
                });
            }

            // Initial query
            updateQuery();


            // TODO: Refactor: rename to updatePreview() bc it's more accurate
            function updateFormatting() {
                // console.log("updateFormatting");

                let className = ".rlb-collection-inner-container." + props.attributes.blockId;

                jQuery(className).replaceWith(getInnerContainerHTML(props.attributes.blockId,
                                                                    props.attributes.imageSize,
                                                                    props.attributes.maxCount,
                                                                    props.attributes.overflow,
                                                                    previewItems,
                                                                    props.attributes.showDescriptions,
                                                                    props.attributes.showImages,
                                                                    props.attributes.showInfo,
                                                                    props.attributes.backgroundColor,
                                                                    props.attributes.textColor,
                                                                    props.attributes.titleColor));

                updatePlaceholder();
            }

            // --------------------------------------------
            // onChange and Toggling
            // --------------------------------------------
            function updatePlaceholder() {
                let newCount  = props.attributes.maxCount;
                let newHeight = props.attributes.imageSize;
                let newMargin = "";
                let newWidth  = props.attributes.imageSize;

                if (!props.attributes.showImages) {
                    if (newCount > previewItems.length) newCount = previewItems.length

                    newHeight = (150 * newCount) + "px";
                    newMargin = "2rem";
                    newWidth  = "100vw";
                }

                props.setAttributes({
                    placeholderMargin: newMargin,
                    placeholderHeight: newHeight,
                    placeholderWidth:  newWidth
                });
            }
            function onChangeBackgroundColor(value) {
                // console.log("backgroundColor:", value);
                props.setAttributes({
                    backgroundColor: value
                });
                updateFormatting();
            }
            function onChangeTextColor(value) {
                // console.log("textColor:", value);
                props.setAttributes({
                    textColor: value
                });
                updateFormatting();
            }
            function onChangeTitleColor(value) {
                // console.log("titleColor:", value);
                props.setAttributes({
                    titleColor: value
                });
                updateFormatting();
            }
            function onChangeHeadingText(value) {
                // console.log('headingText: ', value);
                props.setAttributes({
                    headingText: value
                });
            }
            function onChangeMaxCount(value) {
                // console.log('maxCount: ', value);
                props.setAttributes({
                    maxCount: value,
                });
                updateFormatting();
            }
            function onChangeOrder(value) {
                // console.log('order: ', value);
                props.setAttributes({
                    order: value
                });
                updateQuery();
            }
            function onChangeOrderBy(value) {
                // console.log('orderBy: ', value);
                props.setAttributes({
                    orderBy: value
                });
                updateQuery();
            }
            function toggleShowPosts(value) {
                // console.log('showPosts: ', value);
                props.setAttributes({
                    showPosts: value
                });
                updateQuery();
            }
            function toggleShowAwards(value) {
                // console.log('showAwards: ', value);
                props.setAttributes({
                    showAwards: value
                });
                updateQuery();
            }
            function toggleShowEvents(value) {
                // console.log('showEvents: ', value);
                props.setAttributes({
                    showEvents: value
                });
                updateQuery();
            }
            function toggleShowMentions(value) {
                // console.log('showMentions: ', value);
                props.setAttributes({
                    showMentions: value
                });
                updateQuery();
            }
            function toggleShowProducts(value) {
                // console.log('showProducts: ', value);
                props.setAttributes({
                    showProducts: value
                });
                updateQuery();
            }
            function onChangeEmptyText(value) {
                // console.log('emptyText: ', value);
                props.setAttributes({
                    emptyText: value
                });
            }
            function onChangeImageSize(value) {
                // console.log('imageSize: ', value);
                props.setAttributes({
                    imageSize: value
                });
                updateFormatting();
            }
            function onChangeImageUnits(value) {
                // console.log('imageUnits: ', value);
                props.setAttributes({
                    imageUnits: value
                });
                updateFormatting();
            }
            function toggleShowImages(value) {
                // console.log('showImages: ', value);
                props.setAttributes({
                    showImages: value
                });
                updateFormatting();
            }
            function onChangeFilterDate(value) {
                // console.log('filterDate: ', value);
                props.setAttributes({
                    filterDate: value
                });
                updateQuery();
            }
            function onChangeFilterCategory(value) {
                // console.log('filterCategory: ', value);

                let valueAsObjects = [];

                for (let i of Object.values(value)) {
                    if (typeof i === "object") {
                        console.log("Object");
                        console.log(i);
                        valueAsObjects.push(i);
                    } else if (typeof i === "string" && categories[i] != null) {
                        console.log("String");
                        console.log(i);
                        console.log(categories[i]);
                        valueAsObjects.push(categories[i]);
                    }
                }

                console.log("editor filtercategory valueAsObjects:");
                console.log(JSON.stringify(valueAsObjects));
                let catIds = valueAsObjects.map(x => x["id"]);
                console.log(catIds);

                props.setAttributes({
                    filterCategory: catIds
                });
                updateQuery();
            }
            function toggleShowInfo(value) {
                // console.log('showInfo: ', value);
                props.setAttributes({
                    showInfo: value
                });
                updateFormatting();
            }
            function toggleShowDescriptions(value) {
                // console.log('showDescriptions: ', value);
                props.setAttributes({
                    showDescriptions: value
                });
                updateFormatting();
            }

            function onChangeOverflow(value) {
                // console.log("overflow:", value);

                let overflowValue = (value ? "scale" : "wrap");

                props.setAttributes({
                    overflow:    overflowValue,
                    scaleImages: value
                });
                updateFormatting();
            }


            // --------------------------------------------
            // Edit Output
            // --------------------------------------------
            return el('div',
                      { className: 'rlb-collection-outer-container ' + props.attributes.blockId },
                      [
                          el(RichText,
                              { tagName: 'h2',
                                className: 'rlb-collection-heading ' + props.attributes.blockId,
                                value: props.attributes.headingText,
                                onChange: onChangeHeadingText,
                                placeholder: 'Collection Heading'
                              },
                              null
                          ),
                          el('div',
                              { className: 'rlb-collection-inner-container ' + props.attributes.blockId },
                              null
                          ), // end collection-inner-container

                      ],



                      // ----------------------------------
                      // Sidebar Controls
                      // ----------------------------------
                      el(InspectorControls,
                          { key: 'setting' },
                          [
                              el(PanelBody,
                              { title: 'Query',
                                initialOpen: true
                              },
                              [
                                  el('div',
                                      { className: 'rlb-collection-post-types-container ' + props.attributes.blockId },
                                      [
                                          el(CheckboxControl,
                                              { checked: props.attributes.showPosts,
                                                label: 'Posts',
                                                onChange: toggleShowPosts
                                              },
                                          ),
                                          el(CheckboxControl,
                                              { checked: props.attributes.showAwards,
                                                label: 'Awards',
                                                onChange: toggleShowAwards
                                              },
                                          ),
                                          el(CheckboxControl,
                                              { checked: props.attributes.showEvents,
                                                label: 'Events',
                                                onChange: toggleShowEvents
                                              },
                                          ),
                                          el(CheckboxControl,
                                              { checked: props.attributes.showMentions,
                                                label: 'Mentions',
                                                onChange: toggleShowMentions
                                              },
                                          ),
                                          el(CheckboxControl,
                                              { checked: props.attributes.showProducts,
                                                label: 'Products',
                                                onChange: toggleShowProducts
                                              },
                                          ),
                                      ]
                                  ), // end div (for post type selection)
                                  el(QueryControls,
                                      { maxItems: 50,
                                        numberOfItems: props.attributes.maxCount,
                                        onNumberOfItemsChange: onChangeMaxCount,
                                        onOrderByChange: onChangeOrderBy,
                                        onOrderChange: onChangeOrder,
                                        order: props.attributes.order,
                                        orderBy: props.attributes.orderBy,
                                        categorySuggestions: categories,         // props.attributes... does not work
                                        selectedCategories: props.attributes.filterCategory, //selectedCategoryNames, //props.attributes.filterCategory,  // for categorySuggestions and selectedCategories
                                        onCategoryChange: onChangeFilterCategory
                                      },
                                      null
                                  ),
                                  el(SelectControl,
                                      { label: 'Filter event date',
                                        value: props.attributes.filterDate,
                                        options: [{ value: 'none',     label: 'None'},
                                                  { value: 'upcoming', label: 'Upcoming'},
                                                  { value: 'past',     label: 'Past'}],
                                        onChange: onChangeFilterDate
                                      }
                                  ),
                              ]
                              ), // end Query PanelBody

                              el(PanelBody,
                                  { title:       "Colors",
                                    initialOpen: false
                                  },
                                  [
                                      el("p", null, "Background Color"),
                                      el(ColorPalette,
                                          { colors: colorPalette,
                                            value: props.attributes.backgroundColor,
                                            onChange: onChangeBackgroundColor
                                          },
                                          null
                                      ),
                                      el("p", null, "Title Color"),
                                      el(ColorPalette,
                                          { colors: colorPalette,
                                            value: props.attributes.titleColor,
                                            onChange: onChangeTitleColor
                                          },
                                          null
                                      ),
                                      el("p", null, "Text Color"),
                                      el(ColorPalette,
                                          { colors: colorPalette,
                                            value: props.attributes.textColor,
                                            onChange: onChangeTextColor
                                          },
                                          null
                                      ),
                                  ]
                              ),

                              el(PanelBody,
                                  { title:       "Formatting",
                                    initialOpen: true
                                  },
                                  [
                                      el(__experimentalUnitControl,
                                          { label: 'Image size',
                                            onChange: onChangeImageSize,
                                            onUnitChange: onChangeImageUnits,
                                            value: props.attributes.imageSize + props.attributes.imageUnits
                                          },
                                          null
                                      ),
                                      el(ToggleControl,
                                          { label: 'Show images',
                                            checked: props.attributes.showImages,
                                            onChange: toggleShowImages
                                          },
                                          null
                                      ),
                                      el(ToggleControl,
                                          { label: 'Scale instead of wrapping',
                                            checked: props.attributes.scaleImages,
                                            onChange: onChangeOverflow
                                          },
                                          null
                                      ),
                                      el(ToggleControl,
                                          { label: 'Show info',
                                            checked: props.attributes.showInfo,
                                            onChange: toggleShowInfo
                                          },
                                          null
                                      ),
                                      el(ToggleControl,
                                          { label: 'Show descriptions/excerpts',
                                            checked: props.attributes.showDescriptions,
                                            onChange: toggleShowDescriptions
                                          },
                                          null
                                      ),
                                      el(TextControl,
                                          { label: 'Text displayed if collection is empty',
                                            value: props.attributes.emptyText,
                                            onChange: onChangeEmptyText
                                          },
                                          null
                                      )
                                  ]
                              ) // end Formatting PanelBody
                         ] // end InspectorControls content
                      ) // end InspectorControls
            ); // end return
        }, // end edit


        // --------------------------------------------------------------------
        // Save
        // --------------------------------------------------------------------
        save(props) {
            console.log("editor save filterCategory:");
            console.log(JSON.stringify(props.attributes.filterCategory));
            return el('div',
                       { className:    "rlb-collection-outer-container " + props.attributes.blockId,
                         id:           "block-" + props.attributes.blockId,  // Default WP
                         'data-block': props.attributes.blockId,             // block attributes
                       },
                       [
                           el('h2',
                               { className: 'rlb-collection-heading ' + props.attributes.blockId },
                               props.attributes.headingText
                           ),
                           el("div",
                               { className: "rlb-collection-placeholder-container " + props.attributes.blockId,
                                 style: "background-color: " + props.attributes.backgroundColor + "; " +
                                        "margin-top: "       + props.attributes.placeholderMargin + "; " +
                                        "margin-bottom: "    + props.attributes.placeholderMargin + "; " },
                               [
                               el("div",
                                   { className: "rlb-collection-placeholder " + props.attributes.blockId,
                                     style: "background-color: " + props.attributes.titleColor + "; " +
                                            "color: "  +       props.attributes.textColor + "; " +
                                            "width: "  +       props.attributes.placeholderWidth + "; " +
                                            "height: " +       props.attributes.placeholderHeight + ";" },
                                   "Loading..."
                               ),
                               el("div",
                                   { className: "rlb-collection-placeholder " + props.attributes.blockId,
                                     style: "background-color: " + props.attributes.titleColor + "; " +
                                            "color: "   +      props.attributes.textColor + "; " +
                                            "display: " +      (!props.attributes.showImages ? "none" : "") + "; " +
                                            "width: "   +      props.attributes.placeholderWidth + "; " +
                                            "height: "  +      props.attributes.placeholderHeight + ";" },
                                   "Loading..."
                               ),
                               el("div",
                                   { className: "rlb-collection-placeholder " + props.attributes.blockId,
                                     style: "background-color: " + props.attributes.titleColor + "; " +
                                            "color: "  +       props.attributes.textColor + "; " +
                                            "display: " +      (!props.attributes.showImages ? "none" : "") + "; " +
                                            "width: "  +       props.attributes.placeholderWidth + "; " +
                                            "height: " +       props.attributes.placeholderHeight + ";" },
                                   "Loading..."
                               ),
                               ]
                           ),
                           el('div',
                               { className: 'rlb-collection-inner-container ' + props.attributes.blockId },
                               null
                           ),
                           el('div',
                               { className: 'rlb-collection-attributes ' + props.attributes.blockId,
                                 hidden: true,

                                 'data-blockId':        props.attributes.blockId,

                                 // Content ----------------------------------------
                                 "data-media":          props.attributes.media,

                                 // Query ------------------------------------------
                                 'data-filterCategory': JSON.stringify(props.attributes.filterCategory), //Object.values(Object.values(props.attributes.filterCategory)).map(x => x['id']),
                                 'data-filterDate':     props.attributes.filterDate,
                                 'data-order':          props.attributes.order,
                                 'data-orderby':        props.attributes.orderBy,

                                 'data-showAwards':     props.attributes.showAwards,
                                 'data-showEvents':     props.attributes.showEvents,
                                 'data-showMentions':   props.attributes.showMentions,
                                 'data-showPosts':      props.attributes.showPosts,
                                 'data-showProducts':   props.attributes.showProducts,
                                 'data-showReviews':    props.attributes.showReviews,

                                 // Formatting -------------------------------------
                                 'data-backgroundColor':  props.attributes.backgroundColor,
                                 'data-emptyText':        props.attributes.emptyText,
                                 'data-imageSize':        props.attributes.imageSize,
                                 'data-imageUnits':       props.attributes.imageUnits,
                                 'data-maxCount':         props.attributes.maxCount,
                                 'data-overflow':         props.attributes.overflow,
                                 'data-showDescriptions': props.attributes.showDescriptions,
                                 'data-showImages':       props.attributes.showImages,
                                 'data-showInfo':         props.attributes.showInfo,
                                 'data-textColor':        props.attributes.textColor,
                                 'data-titleColor':       props.attributes.titleColor,

                                 // Save preview content from editor --> then initialize the frontend plugin with that content while waiting for ajax request
                                 'data-previewItems':     previewItems
                               },
                           ),
                           el('script',
                               { src: '/wp-content/plugins/rlb-collection/rlb-collection-frontend.js',
                                 type: 'module'
                               },
                               null
                           )
                       ]
            ); // end return
        } // end save

    }; // end blockConfig





    wp.blocks.registerBlockType('rodney-lee-brands/rlb-collection', blockConfig);
})();
