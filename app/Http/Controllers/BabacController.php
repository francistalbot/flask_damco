<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use GuzzleHttp\Client;
use GuzzleHttp\Psr7\Uri;
use GuzzleHttp\Cookie\CookieJar;
use Symfony\Component\DomCrawler\Crawler;

define("MAX_PAGINATION_PAGE", '5');

class BabacController extends Controller
{
    private $textPattern = "/^[\w0-9 \-]+$/";

    public function BabacSearch(Request $request)
    { 
        $base_url = "https://cyclebabac.com/";
        $login_url = "https://cyclebabac.com/wp-login.php";
    
        // Récupérez le paramètre 'search' depuis la requête
        $searchTerm = $request->query('search', '');  // Valeur par défaut : chaîne vide

        // Valider le terme de recherche
        if (preg_match($this->textPattern, $searchTerm)) {
            $recherche =$this-> do_the_search($searchTerm, $base_url, $login_url);
           return $recherche;
        }
        else {
            return response()->json(["error" => "Invalid search text"], 400);
        }
    }

    private function do_the_search(string $searchTerm, string $base_url, string $login_url)
    {
        try{
            //Load credentials for the connexion
            [$username, $password] = $this -> load_config();

            //Create a new client and connect it to the website
            [$client, $loggedin] = $this -> create_session($username,$password,$login_url,$base_url);
            
            if ($loggedin){
                //Search on the website and get the page
                [$list_cards, $single_result] = $this -> search_item($client, $searchTerm, $base_url);
                //Extract specific value (name, price, etc) from the page
                $list_products = $this -> parse_results($list_cards, $base_url, $single_result);
                return response()->json([
                    'success' => true,
                    'message' => '',
                ], 200);
            }
            else {
                return response()->json([
                    'success' => false,
                    'message' =>  "Login failed",
                ], 401);
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
        $username = env('BABAC_USERNAME');
        $password = env('BABAC_PASSWORD');
        return[$username, $password];
    }

    private function create_session(string $username, string $password, string $login_url,string $base_url)
    {
        $loggedin_confirmation = "wordpress_logged_in_";
        $loggedin = false;


      //Étape 0. Initialiser un client HTTP
        $jar = new CookieJar();
        $client = new Client([
            'cookies' => $jar,
        ]);

      // Étape 1 : Préparer les données pour la connexion
        $headers = [
            'Cookie' => 'wordpress_test_cookie=WP+Cookie+check',
            'Content-Type' => 'application/x-www-form-urlencoded',
            'Referer' => $base_url,
            'User-Agent' => 'La Remise',
        ];

        $data = [
            'log' => $username,
            'pwd' => $password,
            'wp-submit' => 'Log In',
        ];

      // Étape 3 : Envoyer la requête POST de connexion
        $loginResponse = $client->post($login_url, [
            'verify' => false, // Désactive la vérification SSL
            'form_params' => $data,
            'headers' => $headers,
        ]);

      //Étape 4 : Confirme la connexion du client
        foreach ($jar->toArray() as $cookie) {
            if (strpos($cookie['Name'], $loggedin_confirmation) === 0) { // Vérifie si le nom commence par "wordpress_logged_in_"
                $loggedin = true;
                break;
            }
        }

        return [$client, $loggedin];
    }
    private function search_item(Client $client,string $searchTerm,string $base_url): array
    {
      // Étape 1 : Préparer les données pour de recherche
        $headers = [
            'Content-Type' => 'application/x-www-form-urlencoded',
            'User-Agent' => 'La Remise',
        ];

        $searchDict = [
            's' => $searchTerm,
            'product_cat' => '',
            'post_type' => 'product',
        ];
      // Étape 2 : Envoyer la requête GET de recherche
        //TODO remove "'verify' => false" and use a more secure way to access
         $searchResponse = $client->request('GET', $base_url, [
            'headers' => $headers,
            'query' => $searchDict, // Ajoute les paramètres GET
            'verify' => false,
            'allow_redirects' => [
                'track_redirects' => true
            ]
        ]);

      // Étape 3 : Check if the client have been redirect to a single product page
        if ($searchResponse->getHeader('X-Guzzle-Redirect-History'))
            $single_result = True;
        else
            $single_result = False;

      // Étape 4 : Extracts the html products cards of the page 
      // Étape 4a: Extract for the single product page
        if ($single_result){
            $list_cards = $this -> extractHtmlElements( $searchResponse->getBody(), 'div','class', 'summary entry-summary');
        }
        else {
          // Étape 4b: Extract for the multiple product page and do for the multiples pages
            $list_cards = $this -> extractHtmlElements( $searchResponse->getBody(), 'div','class', 'product-list-item');
            $next_page_url = $this -> extractHtmlElements( $searchResponse->getBody(), 'a','class', 'pagination-item-next-link', 'href');
            $page_num = 1;
            while($next_page_url && $page_num < MAX_PAGINATION_PAGE){
                echo "Page".$page_num;
               echo $next_page_url;
                $page_num++;
                $searchResponse = $client->request('GET', $next_page_url, [
                    'headers' => $headers,
                    'verify' => false]);
                $page_cards = $this -> extractHtmlElements( $searchResponse->getBody(), 'div','class', 'product-list-item');
                $list_cards = array_merge($list_cards,$page_cards );
                $next_page_url = $this -> extractHtmlElements( $searchResponse->getBody(), 'a','class', 'pagination-item-next-link', 'href');         
            }; 
        }
        return [$list_cards, $single_result];
    }
    
    private function parse_results(array $list_cards, string $base_url)
    {
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
    private function extractHtmlElements(string $htmlContent, string $tag, ?string $fieldType = null, ?string $fieldValue = null, ?string $attributeToExtract = null)
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

        $elements = null;
        foreach ($nodes as $node) {
            if ($attributeToExtract) {
                if (strtolower($attributeToExtract) === 'content') {
                    // Si l'attribut est "Content", on extrait le texte ou le contenu HTML de l'élément
                    $fieldValue = $node->textContent;  // Par défaut, on prend le texte
                    // Si vous voulez le contenu HTML de l'élément, vous pouvez utiliser saveHTML
                    // $fieldValue = $dom->saveHTML($node);
                    $elements = trim($fieldValue);
                } else {
                    // Cherche un attribut ou texte spécifique
                    $fieldValue = $node->getAttribute($attributeToExtract) ?: $node->textContent;
                    $elements = trim($fieldValue);
                }
            } else {
                // Renvoie le HTML complet du nœud
                $elements[] = $dom->saveHTML($node);
            }
        }

        return $elements;
    }
}