import { getInnerContainerHTML, getItemHTML, getItemInfoHTML } from "./rlb-collection-render.js";

window.addEventListener("load", () => {
    if (document.querySelector(".rlb-collection-attributes") != null) {

        const collectionElements =  document.querySelectorAll(".rlb-collection-attributes");


        for (let i = 0; i < collectionElements.length; i++) {

            const attributes = collectionElements[i].dataset;

            console.log("frontend filtercategory:");
            console.log(attributes.filtercategory);

            let data = {                                        // data-* attributes
                "action":           "get_collection_items",     // convert property names
                "blockId":          attributes.blockid,         // to lowercase (e.g. "data-blockId" -> attributes.blockid)

                // Content --------------------------------
                "media":            JSON.parse(attributes.media),

                // Query ----------------------------------
                "filterCategory":   JSON.parse(attributes.filtercategory),
                "filterDate":       attributes.filterdate,

                "order":            attributes.order,
                "orderby":          attributes.orderby,

                "showAwards":       attributes.showawards,
                "showEvents":       attributes.showevents,
                "showMentions":     attributes.showmentions,
                "showPosts":        attributes.showposts,
                "showProducts":     attributes.showproducts,
                "showReviews":      attributes.showreviews,

                // Formatting -----------------------------
                "backgroundColor":  attributes.backgroundcolor,
                "emptyText":        attributes.emptytext,
                "imageSize":        attributes.imagesize,
                "maxCount":         attributes.maxcount,
                "overflow":         attributes.overflow,
                "showDescriptions": attributes.showdescriptions,
                "showImages":       attributes.showimages,
                "showInfo":         attributes.showinfo,
                "textColor":        attributes.textcolor,
                "titleColor":       attributes.titlecolor,

                // Preview Items --------------------------
                "previewItems":     attributes.previewitems

            };

            let placeHolderSelector    = `.rlb-collection-placeholder-container.${data["blockId"]}`;
            let innerContainerSelector = `.rlb-collection-inner-container.${data["blockId"]}`;
            let previewItems = data["previewItems"];

            // Initialize with cached query results
            jQuery(innerContainerSelector).replaceWith(getInnerContainerHTML(data["blockId"],
                                                                             data["imageSize"],
                                                                             data["maxCount"],
                                                                             data["overflow"],
                                                                             data["media"],
                                                                             data["showDescriptions"],
                                                                             data["showImages"],
                                                                             data["showInfo"],
                                                                             data["backgroundColor"],
                                                                             data["textColor"],
                                                                             data["titleColor"]));
            // Hide placeholder
            jQuery(placeHolderSelector).css("display", "none");

            // Update query results
            try {
                wp.apiFetch({ path: "rodney-lee-brands/rlb-collection/items",
                              method: "POST",
                              data: data

                            }).then((items) => {
                                previewItems = items.html;

                                jQuery(innerContainerSelector).replaceWith(getInnerContainerHTML(data["blockId"],
                                                                                                 data["imageSize"],
                                                                                                 data["maxCount"],
                                                                                                 data["overflow"],
                                                                                                 previewItems,
                                                                                                 data["showDescriptions"],
                                                                                                 data["showImages"],
                                                                                                 data["showInfo"],
                                                                                                 data["backgroundColor"],
                                                                                                 data["textColor"],
                                                                                                 data["titleColor"]));
                            });

            } catch(error) {
                console.log(error);
            }
        }
    }
});