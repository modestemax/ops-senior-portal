/**
 * Program Services Filters
 *
 */

( function() {

	console.log( "Program Services Filters loaded" );

    const filterProgamsAndServices = document.getElementById( 'filter-progams-and-services' );
    const filterInputs             = filterProgamsAndServices.getElementsByTagName( 'input' );
    const searchProgamsAndServices = document.getElementById( 'search-progams-and-services' );
    const applyFilter              = document.getElementById( 'applyFilter' );
    const clearFilters             = document.getElementById( 'clearFilters' );

    /// css classes

    const defaultContent           = 'default-content';
    const csvContent               = 'csv-content';

    // Return early if the filterProgamsAndServices don't exist.
	if ( ! filterProgamsAndServices ) {
		return;
	}

    /// functions
	var bindHandlers = function(){

        applyFilter.addEventListener( 'click', handleApplyFilters, true );
        clearFilters.addEventListener( 'click', handleClearFilters, true );

    }

    handleApplyFilters = function(e){

        //// check if filters are selected

        let filterSelects = [];

        Array.prototype.forEach.call( filterInputs, function( filterInput, i ){
			if( filterInput.checked ){
                filterSelects.push( filterInput.value );
            }
		});

        if( filterSelects.length ){

            searchProgamsAndServices.setAttribute( 'class', 'hide-' + defaultContent + ' show-' + csvContent + ' ' + filterSelects.join( " " ) );

        } else {

            handleClearFilters();

        }

    }

    handleClearFilters = function(e){

        searchProgamsAndServices.setAttribute( 'class', 'show-' + defaultContent+ ' hide-' + csvContent );

        /// reset list
        Array.prototype.forEach.call( filterInputs, function( filterInput, i ){
			filterInput.checked = false;
		});

    }

    bindHandlers();

}() );