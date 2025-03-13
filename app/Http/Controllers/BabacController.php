<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use GuzzleHttp\Client;
use GuzzleHttp\Psr7\Uri;
use GuzzleHttp\Cookie\CookieJar;
use Symfony\Component\DomCrawler\Crawler;

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
                [$result_page, $single_result] = $this -> search_item($client, $searchTerm, $base_url);
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

        $result_page = $searchResponse->getBody()->getContents();

        foreach ($searchResponse->getHeaders() as $name => $values) {
            echo $name . ': ' . implode(', ', $values) . "<br/>";
        }
        echo (string)$searchResponse->getBody(); 

        return [$result_page, $single_result];
    }

 
   
}