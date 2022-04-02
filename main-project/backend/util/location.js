// dummy function to get coordinates, can change later to include google api

async function getCoordsForAddress(address) {
    //encodeURIComponent(address) would convert our address that we get into a URL friendly format
    return {
        lat: 40.780234,
        lng: -73.98730
    }
};

module.exports = getCoordsForAddress;