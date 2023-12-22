function getInnerContainerHTML(blockId, imageSize, maxCount, overflow, previewItems=[], showDescriptions, showImages, showInfo, backgroundColor="", textColor="", titleColor="") {
    let wrap = (overflow == "wrap" ? "wrap" : "nowrap");
    let scale = (overflow == "scale" ? "max-width: 100vw;" : "");
    let direction = ((showImages === false || showImages == "false")? "rlb-collection-column " : "");

    jQuery(".rlb-collection-outer-container." + blockId).css("background-color", backgroundColor);
    jQuery(".rlb-collection-heading." + blockId).css("color", titleColor);

    let style = `<style>
                     ${((showImages !== false && showImages != "false") ?
                         `.rlb-collection-item-container.${blockId} {
                             margin-left: 1rem;
                             margin-right: 1rem;   
                         }` : "")}
                     
                     ${((showInfo !== false && showInfo != "false") ?
                         `.rlb-collection-item-container.rlb-collection-column.${blockId} {
                             margin-top: 2rem;
                             padding-top: 2rem;
                             border-top: 1px solid lightgray;
                         }`
                         :
                         `.rlb-collection-item-container.rlb-collection-column.${blockId} * {
                             justify-content: left;
                         }`
                     )}   
                     
                     ${(textColor !== false ?
                        `.rlb-collection-inner-container.${blockId} * {
                            color: ${textColor} !important;
                        }` : "")}
                 </style>`;

    let innerContainerHTML = `<div class='rlb-collection-inner-container ${direction} ${blockId}'
                                   style='flex-wrap: ${wrap}; ${scale}'>`;

    // Return {{maxCount}} items if there are at least {{maxCount}} total items available.
    // Otherwise, return all available items.
    let itemCount = (previewItems.length >= maxCount ? maxCount : previewItems.length);

    for (let i = 0; i < itemCount; i++) {
        innerContainerHTML += getItemHTML(blockId, imageSize, previewItems[i], showDescriptions, showImages, showInfo);
    }
    innerContainerHTML += "</div>" + style; // end collection-inner-container


    return innerContainerHTML;
}





function getItemHTML(blockId, imageSize, item, showDescriptions, showImages, showInfo) {
    let direction = ((showImages === false || showImages == "false") ? "rlb-collection-column " : "");
    let display   = ((showImages === false || showImages == "false") ? "none" : "block");
    imageSize     = ((showImages === false || showImages == "false") ? "100%" : imageSize);

    let itemHTML = `<div class='rlb-collection-item-container ${direction} ${blockId}' style='width:${imageSize};'>
                        <a class='rlb-collection-item-link ${blockId}' href="${item.link}">

                            <img class='aligncenter rlb-collection-thumbnail ${blockId}'
                                src='${item.image}' 
                                style='display:${display}; height:${imageSize}; width:${imageSize};'/>

                           <div class='rlb-collection-item-name-container ${direction} ${blockId}'>
                               <h4 class='rlb-collection-item-name has-text-align-center ${direction} ${blockId}'>
                                   ${item.name}
                               </h4>
                           </div>
                       </a>
                       <div class='rlb-collection-item-info-container ${direction} ${blockId}'>
                           ${getItemInfoHTML(item, showDescriptions, showInfo)}
                       </div>
                   </div>`;

    return itemHTML;
}





function getItemInfoHTML(item, showDescriptions, showInfo) {
    let itemInfoHTML = "";

    if (showDescriptions !== false && showDescriptions != "false") {
        if (item.type == "events") {
            itemInfoHTML += (item.excerpt ? `<p>${item.excerpt}</p>` : "");
        }
    }
    if (showInfo !== false && showInfo != "false") {
        if (item.type == "events") {
            itemInfoHTML += (item.dates ? `<div class='rlb-collection-event-dates'>${item.dates}</div>` : "");

            if (item.inPersonTickets || item.onlineTickets) {
                itemInfoHTML +=
                    `<div class='rlb-collection-event-tickets'>
                        ${(item.inPersonTickets ? `<a href='${item.inPersonTickets}'>Get in-person tickets</a>` : "")}
                        ${(item.onlineTickets   ? `<a href='${item.onlineTickets}'>Get online tickets</a>` : "")}
                     </div>`;
            }

            // TODO: Refactor age values - "yes"/"no" is less obvious than true/false --> Maybe it should be an int (like 18 or 21)
            (item.age == "yes" ? "<p class='rlb-collection-warning-text'>21+ Event</p>" : "");

        } else if (item.type == "products") {


        } else {
        }
    }
    return itemInfoHTML;
}





export { getInnerContainerHTML, getItemHTML, getItemInfoHTML };