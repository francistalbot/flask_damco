<?php

return [
    'welcome' => 'Rechercher dans le catalogue Damco',
    'Search' => 'Rechercher',
    'SearchLabel' => 'Tapez le nom d\'une pièce ou un numéro de produit pour obtenir son prix et sa disponibilité :',
    'Searching...' => 'Parcours du catalogue Cycle Babac en cours...',
    'NoProductFound' => 'Aucun produit trouvé',
    'Error' => 'Erreur : {{errorMessage}}',
    'Yes' => 'Oui',
    'No' => 'Non',

    'producTable' => [
        'Name' => 'Nom',
        'RetailPrice' => 'Prix de détail',
        'InStock?' => 'En stock ?',
        'Yes' => 'Oui',
    ],

    'searchSummary' => [
        'none' => '<span className="error_message">Aucun produit trouvé.</span>',
        'one' => 'Un résultat trouvé pour <strong>{{search}}</strong> sur Damco.',
        'many' => '{{count}} résultats trouvés pour <strong>{{search}}</strong> sur Damco.',
        'max' => 'De nombreux articles ont été trouvés. Affichage des {{count}} premiers articles pour {{search}} sur Cycle Babac. Plus de résultats peuvent être consultés 
            <0 href=\"https://example.com/\">ici</0>',
    ],

    'searchInput' => [
        'empty' => 'La barre de recherche ne peut pas être vide.',
        'invalid' => 'La recherche contient des caractères invalides.',
        'placeholder' => 'ex. petites roues ou 12-345-67',
    ],
];