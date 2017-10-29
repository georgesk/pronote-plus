
/**
 * trombi : exploite les données du trombinoscope
 * puis se retire de la liste des Listeners
 * @return un tableau de (nom, fichier image) encodé en JSON
 **/
function trombi(request, sender, sendResponse) {
    if (request.action=="trombino"){
	var result=[];
	var tdTrombi=document.getElementById(
	    "GInterface.Instances[1].Instances[1]"
	);
	var divs=tdTrombi.childNodes;
	for (var i=0; i < divs.length; i++){
	    var d=divs[i];
	    var subDivs=d.getElementsByTagName("div");
	    var divImage=subDivs[0];
	    var divNom=subDivs[1];
	    var imgs=divImage.getElementsByTagName("img");
	    var img;
	    if (imgs.length > 0){
		img = divImage.getElementsByTagName("img")[0];
		result.push({nom: divNom.textContent, image: img.src})
	    } else {
		result.push({nom: divNom.textContent, image: "http://185.163.29.134/pronote/FichiersRessource/PortraitSilhouette.png"})
	    }
	}
    }
    browser.runtime.onMessage.removeListener(trombi);
    result=JSON.stringify(result)
    return Promise.resolve({response: result});
}


/*
Assign trombi() as a listener for messages from the extension.
*/
browser.runtime.onMessage.addListener(trombi);
