
const EleventyFetch = require( "@11ty/eleventy-fetch" );
const Papa          = require( "papaparse" );

module.exports = async function() {

  let url = "https://q30design.com/data/csv/seniors-content-planning-spreadsheet-updated.csv";

  //// This returns a promise
  let csv = await EleventyFetch( url, {
    duration: "1d",
    type: "text"   
  } );

  let seniorsContent = Papa.parse( csv, { header: true, transform: function( _v ){ return _v.trim(); }, encoding: "utf-8" } ).data;

  let tag1 = seniorsContent.map( seniorsContent => seniorsContent[ "Tag 1" ] );
  let tag2 = seniorsContent.map( seniorsContent => seniorsContent[ "Tag 2" ] );
  let tag3 = seniorsContent.map( seniorsContent => seniorsContent[ "Tag 3" ] );
  let tag4 = seniorsContent.map( seniorsContent => seniorsContent[ "Tag 4" ] );
  let tags = tag1.concat( tag2, tag3, tag4 );

  tags = tags.map( function( __string ){
    if( __string != undefined ){
        return __string;
    }
    return '';
  } );

  let uniqueTags = [ ...new Set( tags ) ].sort();

  let cssTags = {};
  for( q = 0; q < uniqueTags.length; q++ ){
    if( uniqueTags[q] != '' ){
      cssTags[uniqueTags[q]] = 'filter-'+q;
    }
  }

  return {
    seniorsContent: seniorsContent,
    tags: uniqueTags,
    cssTags: cssTags
  }
  
};
