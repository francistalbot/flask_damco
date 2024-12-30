<?php

return [
    'welcome' => 'Search the Damco catalog',
    'Search' => 'Search',
    'SearchLabel' => 'Type the name of a part, or a product number, in order to obtain its price and availability: ',
    'Searching...' => 'Riding through the Cycle Babac catalog... ',   
    'NoProductFound' => 'No product found',
    'Error' => 'Error : {{errorMessage}}',
    'Yes' => 'Yes',
    'No' => 'No',
    
    'producTable' => [
        'Name' => 'Name',
        'RetailPrice' => 'Retail Price',
        'InStock?' => 'In Stock?',
    ],
    
    'searchSummary' => [
        'none' => '<span className="error_message">No product found.</span>',
        'one' => 'One result found for <strong>{{search}}</strong> on Damco.',
        'many' => '{{count}} results found for <strong>{{search}}</strong> on Damco.',
        'max' => 'Lots of items were found. Printing the first {{count}} items for {{search}} on Cycle Babac. More results can be inspected
            <0  href=\"https://example.com/\">here</0>',

    ],
    'searchInput' => [
        'empty' => 'The search bar cannot be empty.',
        'invalid' => 'The search contains invalid characters.',
        'placeholder' => 'e.g. training wheels or 12-345-67',
    ],
];