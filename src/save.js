import { useBlockProps } from "@wordpress/block-editor";

// axios.get(apiRoot + "wp-json/blake/v1/curated-posts-block-stylesheet/")
// // Handles success
// .then((response) => {
//     console.log("response");
// })
// .catch((error) => {

// });

    // Set API root URL based on environment
    //
    // TODO: Fix how dev env is detected
    //
    // const apiRoot = process.env.NODE_ENV == "development" ? "" : process.env.REACT_APP_API_ROOT;
    let origin = window.location.origin;
    let pluginRootDirectory = `${origin}/server/wp-content/plugins`;
    let apiRoot = origin + "/server/wp-json";

    

export default function Save(props) {

	return (
		<div { ...useBlockProps.save() }>
            <div className="bd-curated-posts">
                <link rel="stylesheet" type="text/css" href={`${pluginRootDirectory}/curated-posts/build/style-index.css`} />
                <div className="bd-curated-posts--posts-box">
                    { (props.attributes.postsComponents.length > 0 ? props.attributes.postsComponents : 
                                                                     <p>No posts</p>) }
                </div>
            </div>
		</div>
	);
}
