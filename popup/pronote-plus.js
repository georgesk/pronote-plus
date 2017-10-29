/*
S'occupe des clics dans le popup.

Si on clique un bouton de class "trombino", récupère le tab actif
 interprète le javascript /content_scripts/trombino.js et y injecte
 un message {action: "trombino"}

 Si le script renvoie une réponse, ajoute un tableau à la fin du popup
 garni de toutes les photos du trombinoscope (6 par ligne).

Si on clique sur un bouton de classe "clear":
  Ferme le popup.
*/

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("clear")) {
	window.close();
    } else if (e.target.classList.contains("trombino")) {
	
	// insère un script qui contient browser.runtime.onMessage.addListener()
	browser.tabs.executeScript(null, { 
	    file: "/content_scripts/trombino.js" 
	}).then(callTrombino).catch((error)=>{
	console.log("Erreur d'exécution du script /content_scripts/trombino.js :", error);
    });
	
    }
});

function callTrombino(){
    var promiseActiveTab = browser.tabs.query({active: true, currentWindow: true});
    promiseActiveTab.then((tabs) => {
	var msg = "trombino";
	browser.tabs.sendMessage(tabs[0].id, {action: msg}).then(
	    reponse => {
		traceTrombi(reponse.response);
	    }
	).catch((e) => {console.log("Erreur de recherche de photos :", e)}
	       );
    }).catch((error)=>{
	console.log("Erreur de recherche de Tab actif :", error);
    });
}


/**
 * dessine un trombinoscope d'après des données JSON
 * de type liste({nom: <chaine>, image: <chaine>})
 **/
function traceTrombi(jsonDivs){
    var divs = JSON.parse(jsonDivs);
    var maxcolonnes=6;
    var i=0;
    var h1=document.createElement("h1");
    h1.textContent="Tableau à copier";
    document.body.appendChild(h1);
    var p=document.createElement("p");
    p.textContent="Le tableau est sélectionné .... Ctrl+C pour le placer dans le presse-papier"
    document.body.appendChild(p);
    var t=document.createElement("table");
    var tr, td;
    document.body.appendChild(t);
    for (let d of divs){
	if (i % maxcolonnes == 0){
	    // nouvelle ligne
	    tr=document.createElement("tr");
	    t.appendChild(tr);
	}
	td=document.createElement("td");
	tr.appendChild(td);
	var img=document.createElement("img");
	img.src=d.image;
	img.width=75;
	img.height=100;
	td.appendChild(img);
	var nomDiv=document.createElement("p");
	nomDiv.textContent=d.nom;
	td.appendChild(nomDiv);
	i++;
    }
    while(i % maxcolonnes != 0){
	// remplissage de la dernière ligne avec des cases vides.
	td=document.createElement("td");
	tr.appendChild(td);
	i++
    }
    // la sélection du tableau fonctionne avec Firefox.
    var range = document.createRange();
    var sel = window.getSelection();
    // annule toute sélection précédente
    sel.removeAllRanges();
    // met le tableau dans la sélection
    range.selectNodeContents(t);
    sel.addRange(range);
    document.execCommand("Copy");
    // annule la sélection comme le tableau est copié
    sel.removeAllRanges();
    p.textContent="Les photos ci-dessous ont été copiées dans le presse-papier (tableau de six photos de 75x100 pixels par ligne)"
}
