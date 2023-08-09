/**
 * Program Services Filters
 *
 */

( function() {

	console.log( "Program Services Filters loaded" );

    const filterProgamsAndServices = document.getElementById( 'filter-progams-and-services' );
    const searchProgramsAndServices = document.getElementById('search-programs-and-services');
    const filterInputs             = filterProgamsAndServices.getElementsByTagName( 'input' );
    const searchProgamsAndServices = document.getElementById( 'search-progams-and-services' );
    const applyFilter              = document.getElementById( 'applyFilter' );
    const clearFilters             = document.getElementById( 'clearFilters' );
    const csvContentOutput         = document.getElementById( 'csv-content' )
    const csvContentContainer      = csvContentOutput.querySelectorAll( '.csv-content-container' );

    /// css classes

    const defaultContent           = 'default-content';
    const csvContent               = 'csv-content';
    const noResults                = 'no-results';

    // Return early if the filterProgamsAndServices don't exist.
	if ( ! filterProgamsAndServices ) {
		return;
	}

    /// functions
	var bindHandlers = function(){

        /// applyFilter.addEventListener( 'click', handleApplyFilters, true );
        /// clearFilters.addEventListener( 'click', handleClearFilters, true );

        Array.prototype.forEach.call( filterInputs, function( filterInput, i ){
            filterInput.addEventListener( 'click', handleApplyFilters, true );
		});

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

            handleCheckResults( filterSelects );
            searchProgamsAndServices.setAttribute( 'class', 'hide-' + defaultContent + ' show-' + csvContent + ' ' + filterSelects.join( " " ) );

        } else {

            handleClearFilters();

        }

    }

    handleClearFilters = function(e){

        searchProgamsAndServices.setAttribute( 'class', 'show-' + defaultContent + ' hide-' + csvContent );

        /// reset list
        Array.prototype.forEach.call( filterInputs, function( filterInput, i ){
			filterInput.checked = false;
		});

    }

    handleCheckResults = function( filterSelects ){

        Array.prototype.forEach.call( csvContentContainer, function( contentOutput, i ){

            let check        = false;
            let contentGroup = contentOutput.querySelectorAll( '.filter-item' );

            if( contentOutput.classList.contains( noResults ) ){
                contentOutput.classList.remove( noResults );
            }

            Array.prototype.forEach.call( contentGroup, function( contentItem, q ){
                for( let p = 0; p < filterSelects.length; p++ ){
                    if( contentItem.classList.contains( filterSelects[p] ) ){
                        check = true;
                    }
                }
            });

            if( !check ){

                contentOutput.classList.add( noResults );

            }

        });

    }

    bindHandlers();

}() );