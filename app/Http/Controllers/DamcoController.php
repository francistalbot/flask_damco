<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use GuzzleHttp\Client;
use GuzzleHttp\Cookie\CookieJar;
use Symfony\Component\DomCrawler\Crawler;

class DamcoController extends Controller
{
    private $skuPattern = "/^\d{2}[-]?\d{3}[-]?\d{2}$/";
    private $textPattern = "/[a-zA-Z0-9]/";
//      ,-.\/\"

    public function DamcoSearch(Request $request)
    {
        $base_url = "https://www.damourbicycle.com";
        $search_url = "https://www.damourbicycle.com/search-damco/";
        $login_url = "https://www.damourbicycle.com/user/login";

        // Récupérez le paramètre 'search' depuis la requête
        $searchTerm = $request->query('search', ''); // Valeur par défaut : chaîne vide

        // Valider le terme de recherche
        if (preg_match($this->textPattern, $searchTerm)){
            $recherche =$this-> do_the_search($searchTerm, $search_url, $login_url, $base_url);
           return $recherche;
        }
        elseif (preg_match($this->textPattern, $searchTerm)){
            $recherche =$this-> do_the_search($searchTerm, $search_url, $login_url, $base_url);
           return $recherche;
        }
        else{
            return response()->json([
                'success' => false,
                'message' => 'Le paramètre "search" doit correspondre au format SKU (ex. 12-345-67).',
            ], 400);
        }
    }

    private function do_the_search(string $searchTerm, string $search_url, string $login_url, string $base_url)
    {
        try{
            //Load credentials for the connexion
            [$username, $password] = $this -> load_config();

            //Create a new client and connect it to the website
            [$client, $loggedin] = $this -> create_session($username,$password,$login_url);

            if ($loggedin){
                //Search on the website and get the html cards of every product returned
                $list_cards = $this -> search_item($client, $searchTerm, $search_url);
                //Extract specific value (name, price, etc) from each cards
                $list_products = $this -> parse_results($list_cards, $base_url);
                return response()->json([
                    'success' => true,
                    'list_products' => $list_products,
                ], 200);
            }
        } catch (\Exception $e) {
            // Gestion des erreurs
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

     private function load_config(){
        $username = env('DAMCO_USERNAME');
        $password = env('DAMCO_PASSWORD');
        return[$username, $password];
    }

    private function create_session(string $username, string $password, string $login_url)
    {
        $loggedin_confirmation = "SESScc62906ef8fcad373001edc4a710b6ef";
        $loggedin = false;


      //Étape 0. Initialiser un client HTTP
        $jar = new CookieJar();
        $client = new Client([
            'cookies' => $jar,
        ]);

      //Étape 1. Extrait form_build_id de la page
        $htmlResponse = $client->get($login_url, [
            'verify' => false, // Désactive la vérification SSL
        ]);
        // Extraire le form_build_id du HTML
        $user_login_form = $this -> extractHtmlElements( $htmlResponse->getBody(), 'form', 'id', 'user-login-form', );
        $form_build_id = $this -> extractHtmlElements( $user_login_form[0], 'input', 'name', 'form_build_id', 'value');
        if (!$form_build_id) {
            return $loggedin = false;
        }

      // Étape 2 : Préparer les données pour la connexion
        $headers = [
            'Content-Type' => 'application/x-www-form-urlencoded',
            'User-Agent' => 'La Remise',
        ];

        $data = [
            'name' => 'La Remise',
            'pass' => 'Unbonmotdepasse.',
            'form_build_id' => $form_build_id[0],
            'form_id' => 'user_login_form',
            'op' => 'Log+in',
        ];

      // Étape 3 : Envoyer la requête POST de connexion
        $loginResponse = $client->post($login_url, [
            'verify' => false, // Désactive la vérification SSL
            'form_params' => $data,
            'headers' => [
                "Cookie" => "wordpress_test_cookie=WP+Cookie+check",
                'Referer' => $login_url,
                'User-Agent' => 'La Remise',
            ],
        ]);
      //Étape 4 : Confirme la connexion du client
        try{
            if (strpos($loginResponse->getHeader('Set-Cookie')[0], $loggedin_confirmation) !== false){
                $loggedin = true;
            }
        } catch (\Exception $e) {
            $loggedin = false;
        }

        return [$client, $loggedin];
    }

    private function search_item(Client $client,string $searchTerm,string $search_url): array
    {
      // Étape 1 : Préparer les données pour de recherche
        $headers = [
            'Content-Type' => 'application/x-www-form-urlencoded',
            'User-Agent' => 'La Remise',
        ];

        $searchDict = [
            'search' => $searchTerm,
            'view' => 'item',
        ];
      // Étape 2 : Envoyer la requête GET de recherche
        //TODO remove "'verify' => false" and use a more secure way to access
        $searchResponse = $client->request('GET', $search_url, [
            'headers' => $headers,
            'query' => $searchDict, // Ajoute les paramètres GET
            'verify' => false,
        ]);

      // Étape 3 : Obtenir la réponse sous forme de chaîne et extrait la liste des cartes de produit
        $html_content = $searchResponse->getBody()->getContents();
        $list_cards = $this -> extractHtmlElements( $searchResponse->getBody(), 'div','class', 'mb-4 justify-content-center align-items-center vcatalog-item');

      // Étape 4 : Vérifie s'il y plusieurs page paginé et ajoute les cartes de produit de chaque pages a la liste
        $pagination = $this -> extractHtmlElements( $searchResponse->getBody(),'nav', 'class', 'pager-nav');
          if ($pagination){
           $last_page_link = $this -> extractHtmlElements($pagination[0],'a', '','','href');
            $last_page = explode("&page=",end($last_page_link))[1];
            if( (int)$last_page > 10 ){
              $last_page = 10;
            }
            for($page = 1; $page <= $last_page; $page++)
                 {
                    $searchDict['page'] = $page;
                    $searchPage = $client->request('GET', $search_url, [
                        'headers' => $headers,
                        'query' => $searchDict, // Ajoute les paramètres GET
                        'verify' => false,
                    ]);
                    $page_cards = $this -> extractHtmlElements( $searchPage->getBody(), 'div','class', 'mb-4 justify-content-center align-items-center vcatalog-item');
                  $list_cards = array_merge($list_cards,$page_cards );
                }
            }

        return $list_cards;
    }

    private function parse_results(array $list_cards, string $base_url)
    {
        $list_products = [];
        foreach( $list_cards as $card){
            $html_sku = $this -> extractHtmlElements( $card, 'p', 'class', 'font-iten-sku', 'content');
            $item_sku = explode("Item: ", $html_sku[0])[1];

            $html_name = $this -> extractHtmlElements( $card, 'h5', '', '', 'content' );
            $item_name = $html_name[0];
            $item_name = explode(" ()", $item_name)[0];

            $html_price = $this -> extractHtmlElements( $card, 'span', 'class','text-grey mr-1', 'content');
            $item_price = explode("PDSF: $", $html_price[0])[1];

            $html_instock = $this -> extractHtmlElements( $card, 'span', 'class', 'badge-primary');
            if (str_contains($html_instock[0], 'glyphicon-ok-sign') ) {
                $item_instock = true;
            } elseif(str_contains($html_instock[0], 'glyphicon-remove-circle')) {
                $item_instock = false;
            }
            else{
                $item_instock = 'Unable to determine';
            }
            $html_page_url = $this -> extractHtmlElements( $card, 'a', '','','href');
            $item_page_url = $base_url . $html_page_url[0];

            $list_products[] = [
                'sku' => $item_sku,
                'name' => $item_name,
                'price' => $item_price,
                'instock' => $item_instock,
                'page_url' => $item_page_url,
            ];
        }
        return $list_products;
    }

     /**
    * Fonction générique pour extraire des éléments HTML basés sur un attribut spécifique et sa valeur.
    *
    * @param string $htmlContent Contenu HTML brut.
    * @param string $tag Balise HTML cible (ex: 'div', 'a', 'input', etc.).
    * @param string|null $fieldType Type de champ à rechercher (ex: 'class', 'name', 'id', etc.).
    * @param string|null $fieldValue Valeur de l'attribut recherché.
    * @param string|null $attributeToExtract Nom de l'attribut à extraire (ex: 'href', 'src', 'content'). Si null, retourne le contenu texte.
    * @return array Tableau des valeurs extraites.
 */
    private function extractHtmlElements(string $htmlContent, string $tag, ?string $fieldType = null, ?string $fieldValue = null, ?string $attributeToExtract = null): array
    {
        $dom = new \DOMDocument();

        // Désactiver les erreurs et warnings dus aux balises mal formées
        libxml_use_internal_errors(true);
        $dom->loadHTML($htmlContent);
        libxml_clear_errors();

        $xpath = new \DOMXPath($dom);

        $query = "//{$tag}";
        if ($fieldType && $fieldValue) {
            $query .= "[contains(@{$fieldType}, '{$fieldValue}')]";
        }

        $nodes = $xpath->query($query);

        $elements = [];
        foreach ($nodes as $node) {
            if ($attributeToExtract) {
                if (strtolower($attributeToExtract) === 'content') {
                    // Si l'attribut est "Content", on extrait le texte ou le contenu HTML de l'élément
                    $fieldValue = $node->textContent;  // Par défaut, on prend le texte
                    // Si vous voulez le contenu HTML de l'élément, vous pouvez utiliser saveHTML
                    // $fieldValue = $dom->saveHTML($node);
                    $elements[] = trim($fieldValue);
                } else {
                    // Cherche un attribut ou texte spécifique
                    $fieldValue = $node->getAttribute($attributeToExtract) ?: $node->textContent;
                    $elements[] = trim($fieldValue);
                }
            } else {
                // Renvoie le HTML complet du nœud
                $elements[] = $dom->saveHTML($node);
            }
        }

        return $elements;
    }
}
