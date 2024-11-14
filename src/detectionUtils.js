// Detection utility functions

// Convert input string to 24-bit hash.  Used to color-code the category names.
function stringToHash(str) {
  let hash = 987654321;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + str.charCodeAt(i)) | 0;
  }
  return hash & 0xFFFFFF; // 24-bit hash
};

// Capitalize the first letter of each word.  Also replace spaces with underlines.
// The model returns the detection categories in lower case and the spaces make
// it more difficult to add as element attributes.
const capitalizeWords = (str) => {
  //console.log("capitalizeWords() str=" + str);
  return (str.split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('_'));
};

export { stringToHash, capitalizeWords };
