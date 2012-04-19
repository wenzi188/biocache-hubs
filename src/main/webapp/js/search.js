/* 
 *  Copyright (C) 2011 Atlas of Living Australia
 *  All Rights Reserved.
 *
 *  The contents of this file are subject to the Mozilla Public
 *  License Version 1.1 (the "License"); you may not use this file
 *  except in compliance with the License. You may obtain a copy of
 *  the License at http://www.mozilla.org/MPL/
 *
 *  Software distributed under the License is distributed on an "AS
 *  IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 *  implied. See the License for the specific language governing
 *  rights and limitations under the License.
 */

/**
 * Catch sort drop-down and build GET URL manually
 */
function reloadWithParam(paramName, paramValue) {
    var paramList = [];
    var q = $.getQueryParam('q'); //$.query.get('q')[0];
    var fqList = $.getQueryParam('fq'); //$.query.get('fq');
    var sort = $.getQueryParam('sort');
    var dir = $.getQueryParam('dir');
    var lat = $.getQueryParam('lat');
    var lon = $.getQueryParam('lon');
    var rad = $.getQueryParam('radius');
    var taxa = $.getQueryParam('taxa');
    // add query param
    if (q != null) {
        paramList.push("q=" + q);
    }
    // add filter query param
    if (fqList != null) {
        paramList.push("fq=" + fqList.join("&fq="));
    }
    // add sort param if already set
    if (paramName != 'sort' && sort != null) {
        paramList.push('sort' + "=" + sort);
    }

    if (paramName != null && paramValue != null) {
        paramList.push(paramName + "=" +paramValue);
    }
    
    if (lat && lon && rad) {
        paramList.push("lat=" + lat);
        paramList.push("lon=" + lon);
        paramList.push("radius=" + rad);
    }
    
    if (taxa) {
        paramList.push("taxa=" + taxa);
    }

    //alert("params = "+paramList.join("&"));
    //alert("url = "+window.location.pathname);
    window.location.href = window.location.pathname + '?' + paramList.join('&');
}

/**
 * triggered when user removes an active facet - re-calculates the request params for
 * page minus the requested fq param
 */
function removeFacet(facet) {
    var q = $.getQueryParam('q'); //$.query.get('q')[0];
    var fqList = $.getQueryParam('fq'); //$.query.get('fq');
    var lat = $.getQueryParam('lat');
    var lon = $.getQueryParam('lon');
    var rad = $.getQueryParam('radius');
    var taxa = $.getQueryParam('taxa');
    var paramList = [];
    if (q != null) {
        paramList.push("q=" + q);
    }
    
    if (lat && lon && rad) {
        paramList.push("lat=" + lat);
        paramList.push("lon=" + lon);
        paramList.push("radius=" + rad);
    }
    
    if (taxa) {
        paramList.push("taxa=" + taxa);
    }

    //alert("this.facet = "+facet+"; fqList = "+fqList.join('|'));

    if (fqList instanceof Array) {
        //alert("fqList is an array");
        for (var i in fqList) {
            var thisFq = decodeURI(fqList[i]); //.replace(':[',':'); // for dates to work
            //alert("fq = "+thisFq + " || facet = "+facet);
            if (thisFq.indexOf(facet) != -1) {  // if(str1.indexOf(str2) != -1){
                //alert("removing fq: "+fqList[i]);
                fqList.splice($.inArray(fqList[i], fqList), 1);
            }
        }
    } else {
        //alert("fqList is NOT an array");
        if (decodeURI(fqList) == facet) {
            fqList = null;
        }
    }
    //alert("(post) fqList = "+fqList.join('|'));
    if (fqList != null) {
        paramList.push("fq=" + fqList.join("&fq="));
    }

    window.location.href = window.location.pathname + '?' + paramList.join('&') + window.location.hash;
}

/**
 * Load all the charts 
 */
function loadAllCharts() {
    var queryString = BC_CONF.searchString.replace("?q=","");
    var biocacheServiceUrl = BC_CONF.biocacheServiceUrl; //BC_CONF.biocacheServiceUrl, // "http://ala-macropus.it.csiro.au/biocache-service";
    
    var taxonomyChartOptions = {
        query: queryString,
        backgroundColor: "#eeeeee",
        biocacheServicesUrl: biocacheServiceUrl,
        displayRecordsUrl: BC_CONF.serverName
    };
    
    var facetChartOptions = {
        query: queryString, 
        charts: ['institution_uid','state','species_group','assertions','type_status','biogeographic_region','state_conservation','occurrence_year'],
        institution_uid: {backgroundColor: "#eeeeee"},
        state: {backgroundColor: "#eeeeee"},
        species_group: {backgroundColor: "#eeeeee", title: 'By higher-level group', ignore: ['Animals','Insects','Crustaceans']},
        assertions: {backgroundColor: "#eeeeee"},
        type_status: {backgroundColor: "#eeeeee"},
        biogeographic_region: {backgroundColor: "#eeeeee"},
        state_conservation: {backgroundColor: "#eeeeee"},
        occurrence_year:{backgroundColor: "#eeeeee"},
        biocacheServicesUrl: biocacheServiceUrl,
        displayRecordsUrl: BC_CONF.serverName
    };
    
    loadTaxonomyChart(taxonomyChartOptions);
    loadFacetCharts(facetChartOptions);
}

/**
 * Load images in images tab
 */
function loadImagesInTab() {
    loadImages(0);
}

function loadImages(start) {
    start = (start) ? start : 0;
    var imagesJsonUri = BC_CONF.biocacheServiceUrl + "/occurrences/search.json" + BC_CONF.searchString + 
        "&fq=multimedia:Image&facet=false&pageSize=20&start=" + start + "&sort=last_load_date&dir=desc&callback=?";
    $.getJSON(imagesJsonUri, function(data) {
        //console.log("data",data);
        if (data.occurrences) {
            //var htmlUl = "";
            if (start == 0) {
                $("#imagesGrid").html("");
            }
            var count = 0;
            $.each(data.occurrences, function(i, el) {
                //console.log("el", el.image);
                var imgSrc = el.image;
                if (imgSrc.match("biocache-media")) {
                    imgSrc = imgSrc.replace(/^\/data/,'http://biocache.ala.org.au').replace(/\.(jpg|JPG|jpeg|JPEG|gif|GIF|png|PNG)$/, "__small.$1");
                }
                count++;
                var imgEl = $("<img src='" + imgSrc +
                    "' style='height: 100px; cursor: pointer;'/>");
                var metaData = {
                    uuid: el.uuid,
                    rank: el.taxonRank,
                    rankId: el.taxonRankID,
                    sciName: el.raw_scientificName,
                    commonName: (el.raw_vernacularName) ? "| " + el.raw_vernacularName : "",
                    date: new Date(el.eventDate * 1000),
                    basisOfRecord: el.basisOfRecord
                };
                imgEl.data(metaData);
                //htmlUl += htmlLi;
                $("#imagesGrid").append(imgEl);
                
            });
            
            if (count + start < data.totalRecords) {
                //console.log("load more", count, start, count + start, data.totalRecords);
                $('#imagesGrid').data('count', count + start);
                $("#loadMoreImages").show();
            } else {
                $("#loadMoreImages").hide();
            }
            
            $('#imagesGrid img').ibox(); // enable hover effect
        }
    });
}

/**
 * iBox Jquery plugin for Google Images hover effect.
 * Origina by roxon http://stackoverflow.com/users/383904/roxon
 * Posted to stack overflow: 
 *   http://stackoverflow.com/questions/7411393/pop-images-like-google-images/7412302#7412302
 */
(function($) {
    $.fn.ibox = function() {
        // set zoom ratio //
        resize = 50; // pixels to add to img height
        ////////////////////
        var img = this;
        img.parent().append('<div id="ibox" />');
        var ibox = $('#ibox');
        var elX = 0;
        var elY = 0;

        img.each(function() {
            var el = $(this);

            el.mouseenter(function() {
                ibox.html('');
                var elH = el.height();
                var elW = el.width();
                var ratio = elW / elH; //(elW > elH) ? elW / elH : elH / elW;
                var newH = elH + resize;
                var newW = newH * ratio;
                var offset = (((newW - elW) / 2) + 6);
                //console.log(ratio, elW, newW, offset);
                elX = el.position().left - offset ; // 6 = CSS#ibox padding+border
                elY = el.position().top - 6;
                var h = el.height();
                var w = el.width();
                var wh;
                checkwh = (h < w) ? (wh = (w / h * resize) / 2) : (wh = (w * resize / h) / 2);

                $(this).clone().prependTo(ibox);
                var md = $(el).data();
                var link = BC_CONF.contextPath + "/occurrences/"  + md.uuid;
                var itals = (md.rankId >= 6000) ? "<span style='font-style: italic;'>" : "<span>";
                var infoDiv = "<div style=''><a href='" + link + "'><span style='text-transform: capitalize'>" + 
                    md.rank + "</span>: " +  itals + md.sciName + "</span> " + 
                    md.commonName + "</a></div>";
                $(ibox).append(infoDiv);
                $(ibox).click(function(e) {
                    e.preventDefault();
                    window.location.href = link;
                });
                
                ibox.css({
                    top: elY + 'px',
                    left: elX + 'px',
                    "max-width": $(el).width() + (2 * wh) + 12
                });

                ibox.stop().fadeTo(200, 1, function() {
                    //$(this).animate({top: '-='+(resize/2), left:'-='+wh},200).children('img').animate({height:'+='+resize},200);
                    $(this).children('img').animate({height:'+='+resize},200);
                });
                
            });

            ibox.mouseleave(function() {
                ibox.html('').hide();
            });
        });
    };
})(jQuery);

// vars for hiding drop-dpwn divs on click outside tem
var hoverDropDownDiv = false;

// Jquery Document.onLoad equivalent
$(document).ready(function() {
    // listeners for sort & paging widgets
    $("select#sort").change(function() {
        var val = $("option:selected", this).val();
        reloadWithParam('sort',val);
    });
    $("select#dir").change(function() {
        var val = $("option:selected", this).val();
        reloadWithParam('dir',val);
    });
    $("select#sort").change(function() {
        var val = $("option:selected", this).val();
        reloadWithParam('sort',val);
    });
    $("select#dir").change(function() {
        var val = $("option:selected", this).val();
        reloadWithParam('dir',val);
    });
    $("select#per-page").change(function() {
        var val = $("option:selected", this).val();
        reloadWithParam('pageSize',val);
    });

    // download link
    $("#downloadLink, #alertsLink, #downloadMapLink").fancybox({
        'hideOnContentClick' : false,
        'hideOnOverlayClick': true,
        'showCloseButton': true,
        'titleShow' : false,
        'autoDimensions' : false,
        'width': '500',
        'height': '300',
        'padding': 10,
        'margin': 10,
        onCleanup: function() {
            $("label[for='reasonTypeId']").css("color","#444");
        }
    });

    // set height of resultsOuter div to solrResults height
    var pageLength = $("select#per-page").val() || 20;
    var solrHeight = $("div.solrResults").height() + (2 * pageLength) + 70;
    var mapHeight = $("div#mapwrapper").height();
    //console.log("solrHeight", solrHeight, mapHeight, pageLength);
    $("div.solrResults").css("height", (solrHeight > mapHeight ) ? solrHeight : mapHeight );

    // animate the display of showing results list vs map
    // TODO: make this a toggle() so that double clicks don't break it
    var hashType = ["list", "map"]; //
    $("#listMapButton").click(function(e) {
        e.preventDefault();
        // remove name so changing hash value does not jump the page
        $(".jumpTo").attr("name", ""); 
        // change the button text...
        $("#listMapButton").fadeOut('slow', function() {
            // Animation complete
            var spanText = $("#listMapLink").html();
            if (spanText == 'Map') {
                $("#listMapLink").html('List');
                window.location.hash = "map";
            } else {
                $("#listMapLink").html('Map');
                window.location.hash = 'list';
            }
            // add <a name=""> attr's back
            $(".jumpTo").each(function(i, el) {
                $(this).attr("name", hashType[i]);
            });
        });
        $("#listMapButton").fadeIn('slow');
        
        // make list & map div slide left & right
        var $listDiv = $("div.solrResults"); // list
        $listDiv.animate({
            left: parseInt($listDiv.css('left'),10) == 0 ? -$listDiv.outerWidth() : 0},
            {duration: "slow"}
        );
        var $mapDiv = $("div#mapwrapper"); // map
        $mapDiv.animate({
            left: parseInt($mapDiv.css('left'),10) == 0 ? $mapDiv.outerWidth() : 0},
            {duration: "slow"}
        );
    });

    // page load - detect if map is requested via #map hash
    if (window.location.hash == "#map") {
        //alert("hash is map");
        $("div.solrResults").css("left", -730);
        $("div#mapwrapper").css("left", 0);
        $("#listMapLink").html("List");
    } else if (window.location.hash == "" && $.getQueryParam('start')) {
        window.location.hash = "#list";
    }

    // add hash to URIs for facet links, so map/list state is maintained
    $(".subnavlist a").click(function(e) {
        e.preventDefault();
        var url = $(this).attr("href");
        window.location.href = url + window.location.hash;
    });

    // add show/hide links to facets
    $('ul.facets').oneShowHide({
            numShown: 3,
            showText : '+ show more',
            hideText : '- show less',
            className: 'showHide'
        });
    
    // Substitute LSID strings for tacon names in facet values for species
    var guidList = [];
    $("li.species_guid, li.genus_guid").each(function(i, el) {
        guidList[i] = $(el).attr("id");
    });
    
    if (guidList.length > 0) {
        // AJAX call to get names for LSIDs
        // IE7< has limit of 2000 chars on URL so split into 2 requests        
        var guidListA = guidList.slice(0, 15) // first 15 elements
        var jsonUrlA = BC_CONF.bieWebappUrl + "/species/namesFromGuids.json?guid=" + guidListA.join("&guid=") + "&callback=?";
        $.getJSON(jsonUrlA, function(data) {
            // set the name in place of LSID
            $("li.species_guid, li.genus_guid").each(function(i, el) {
                if (i < 15) {
                    $(el).find("a").html("<i>"+data[i]+"</i>");
                } else {
                    return false; // breaks each loop
                }
            });
        });
        
        if (guidList.length > 15) {
            var guidListB = guidList.slice(15)
            var jsonUrlB = BC_CONF.bieWebappUrl + "/species/namesFromGuids.json?guid=" + guidListB.join("&guid=") + "&callback=?";
            $.getJSON(jsonUrlB, function(data) {
                // set the name in place of LSID
                $("li.species_guid, li.genus_guid").each(function(i, el) {
                    // skip forst 15 elements
                    if (i > 14) {
                        var k = i - 15;
                        $(el).find("a").html("<i>"+data[k]+"</i>");
                    }
                });
            });
        }
    }
    
    // do the same for the selected facet
    var selectedLsid = $("b.species_guid").attr("id");
    if (selectedLsid) {
        var jsonUrl2 = BC_CONF.bieWebappUrl + "/species/namesFromGuids.json?guid=" + selectedLsid + "&callback=?";
        $.getJSON(jsonUrl2, function(data) {
            // set the name in place of LSID
            $("b.species_guid").html("<i>"+data[0]+"</i>");
        });
    }
    
    // remove *:* query from search bar
    var q = $.getQueryParam('q');
    if (q && q[0] == "*:*") {
        $(":input#solrQuery").val("");
    }
    
    // show hide facet display options
    $("#customiseFacets a").click(function(e) {
        e.preventDefault();
        $('#facetOptions').toggle();
    });
    
    $("#facetOptions").position({
        my: "left top",
        at: "left bottom",
        of: $("#customiseFacets"), // or this
        offset: "0 -1",
        collision: "none"
    });
    $("#facetOptions").hide();

    // user selectable facets...
    $(":input#updateFacetOptions").live("click",function(e) {
        e.preventDefault();
        //alert("about to reload with new facets...");
        var selectedFacets = [];
        // iterate over seleted facet options
        $(":input.facetOpts:checked").each(function(i, el) {
            selectedFacets.push($(el).val());
        });

        //Check user has selected at least 1 facet
        if (selectedFacets.length > 0) {
            // save facets to the user_facets cookie
            $.cookie("user_facets", selectedFacets, { expires: 7 });
            // reload page
            document.location.reload(true);
        } else {
            alert("Please select at least 1 filter category to display");
        }

    });

    // load stored prefs from cookie
    var userFacets = $.cookie("user_facets");
    if (userFacets) {
        $(":input.facetOpts").removeAttr("checked"); 
        var facetList = userFacets.split(",");
        for (i in facetList) {
            if (typeof facetList[i] === "string") {
                var thisFacet = facetList[i];
                //console.log("thisFacet", thisFacet);
                $(":input.facetOpts[value='"+thisFacet+"']").attr("checked","checked");
            }
        }
    } else {
        // trigger reload if any default facets are un-checked (AVH)
        $(":input.facetOpts").each(function(i, el) {
            if (!this.checked) {
                //alert($(el).val() + " is " + $(el).attr('checked'));
                $(":input#updateFacetOptions").click();
                return false;
            }
        });
    }
    // select all and none buttons
    $("a#selectNone").click(function(e) {
        e.preventDefault();
        $(":input.facetOpts").removeAttr("checked");
    });
    $("a#selectAll").click(function(e) {
        e.preventDefault();
        $(":input.facetOpts").attr("checked","checked");
    });
    
    // taxa search - show included synonyms with popup to allow user to refine to a single name
    $("span.lsid").each(function(i, el) {
        var lsid = $(this).attr("id");
        var nameString = $(this).html();
        var maxFacets = 30;
        var queryContextParam = (BC_CONF.queryContext) ? "&qc=" + BC_CONF.queryContext : "";
        var jsonUri = BC_CONF.biocacheServiceUrl + "/occurrences/search.json?q=lsid:" + lsid + "&" + BC_CONF.facetQueries +
            "&facets=raw_taxon_name&pageSize=0&flimit=" + maxFacets + queryContextParam + "&callback=?";
        $.getJSON(jsonUri, function(data) {
            // list of synonyms
            var synList = "<div class='refineTaxaSearch' id='refineTaxaSearch_"+i+"'>" +
                //"<form name='raw_taxon_search' class='rawTaxonSearch' id='rawTaxonSearch_"+i+"' action='" +
                // BC_CONF.contextPath + "/occurrences/search' method='POST'>" +
                "This taxon search includes records with synonyms and child taxa of <b>" + nameString + 
                "</b> (<a href='" + BC_CONF.bieWebappUrl + "/species/" + lsid + "' title='Species page' target='BIE'>" +
                "view species page</a>).<br/><br/>Verbatim scientific names " +
                "which appear on records in this result set: <input type='submit' class='rawTaxonSumbit' id='rawTaxonSumbit_"+i+
                "' value='Search with selected verbatim names' style='display:inline-block;float:right;'/>" +
                "<div class='rawTaxaList'>";
            var synListSize = 0;
            $.each(data.facetResults, function(k, el) {
                //console.log("el", el);
                if (el.fieldName == "raw_taxon_name") {
                    $.each(el.fieldResult, function(j, el1) {
                        synListSize++;
                        synList += "<input type='checkbox' name='raw_taxon_guid' id='rawTaxon_" + j +
                            "' class='rawTaxonCheckBox' value='" + el1.label + "'/>&nbsp;" +
                            "<a href='" + BC_CONF.contextPath + "/occurrences/search?q=raw_taxon_name:%22" + el1.label + "%22'>" + el1.label + "</a> (" + el1.count + ")<br/>";
                    });
                    
                }
            });
            
            if (synListSize == 0) {
                synList += "[no records found]";
            }
            
            synList += "</div>";
            
            if (synListSize >= maxFacets) {
                synList += "<div>[Only showing the top " + maxFacets + " names]</div>";
            } 
            
            synList += "</div>";
            $("#rawTaxonSearchForm").append(synList);
            // position it under the drop down
            $("#refineTaxaSearch_"+i).position({
                my: "right top",
                at: "right bottom",
                of: $(el), // or this
                offset: "0 -1",
                collision: "none"
            });
            $("#refineTaxaSearch_"+i).hide();
        });
        // format display with drop-down
        //$("span.lsid").before("<span class='plain'> which matched: </span>");
        $(el).html("<a href='#' title='click for details about this taxon search' id='lsid_" + i + "'>" + nameString + "</a>");
        $(el).addClass("dropDown");
    });

    // form validation for raw_taxon_name popup div with checkboxes
    $(":input.rawTaxonSumbit").live("click", function(e) {
        e.preventDefault();
        var submitId = $(this).attr("id");
        var formNum = submitId.replace("rawTaxonSumbit_",""); // 1, 2, etc
        var checkedFound = false;

        $("#refineTaxaSearch_" + formNum).find(":input.rawTaxonCheckBox").each(function(i, el) {
            if ($(el).is(':checked')) {
                checkedFound = true;
                return false; // break loop
            }
        });

        if (checkedFound) {
            $("form#rawTaxonSearchForm").submit();
        } else {
            alert("Please check at least one \"verbatim scientific name\" checkbox.");
        }
    });
        
    $("#queryDisplay a").click(function(e) {
        e.preventDefault();
        var j = $(this).attr("id").replace("lsid_", "");
        $("#refineTaxaSearch_"+j).toggle();
    });
    
    // close drop-down divs when clicked outside 
    $('#customiseFacets > a, #refineTaxaSearch, #queryDisplay a, #facetOptions').live("mouseover mouseout", function(event) {
        if ( event.type == "mouseover" ) {
            hoverDropDownDiv = true;
        } else {
            hoverDropDownDiv = false;
        }
    });

    // Hide taxonConcept popup div if clicked outside popup
    $("body").mouseup(function(e) {
        var target = $(e.target);
        if (!hoverDropDownDiv && target.parents(".refineTaxaSearch").length == 0) {
            $('.refineTaxaSearch, #facetOptions').hide();
        }
    });
    
    // Jquery Tools Tabs setup
    var tabsInit = { 
        map: false,
        charts: false,
        images: false
    };

    $(".css-tabs").tabs(".css-panes > div", { 
        history: true,
        effect: 'fade',
        onClick: function(event, tabIndex) {
            if (tabIndex == 1 && !tabsInit.map) {
                // trigger map load
                initialiseMap();
                tabsInit.map = true; // only initialise once!
            } else if (tabIndex == 2 && !tabsInit.charts) {
                // trigger charts load
                loadAllCharts();
                tabsInit.charts = true; // only initialise once!
            } else if (tabIndex == 3 && !tabsInit.images && BC_CONF.hasMultimedia) {
                loadImagesInTab();
                tabsInit.images = true;
            }
        }
    });

    $("#loadMoreImages").live("click", function(e) {
        e.preventDefault();
        var start = $("#imagesGrid").data('count');
        //console.log("start", start);
        loadImages(start);
    });
            
    // add click even on each record row in results list
    $(".recordRow").click(function(e) {
        e.preventDefault();
        window.location.href = BC_CONF.contextPath + "/occurrence/" + $(this).attr("id");
    }).hover(function(){
        // mouse in
        $(this).css('cursor','pointer');
        $(this).css('background-color','#FFF');
    }, function(){
        // mouse out
        $(this).css('cursor','default');
        $(this).css('background-color','transparent');
    });

    // fancybox div for refining search with multiple facet values
    $(".multipleFacetsLink").fancybox({
        'hideOnContentClick' : false,
        'hideOnOverlayClick': true,
        'showCloseButton': true,
        'titleShow' : false,
        'transitionIn': 'elastic',
        'transitionOut': 'elastic',
        'speedIn': 400,
        'speedOut': 400,
        'scrolling': 'auto',
        'centerOnScroll': true,
        'autoDimensions' : false,
        'width': 560,
        'height': 560,
        'padding': 10,
        'margin': 10,
        onCleanup: function() {
            // clear the div#dynamic html
            $("#dynamic").html("");
        },
        onComplete: function(links) {
            var link = links[0];
            // substitute some facet names so sorting works
            var facetName = link.id.replace("multi-","").replace("_guid","").replace("_uid","_name").replace("data_resource_name","data_resource").replace("occurrence_year","decade");
            var displayName = $(link).data("displayname");
            loadMultiFacets(facetName, displayName, "count");
        }
    });

    // form validation for form#facetRefineForm
    $("form#facetRefineForm :input.submit").live("click", function(e) {
        e.preventDefault();
        var fq = ""; // build up OR'ed fq query
        var facetName = $(this).siblings("table#fullFacets").data("facet");
        var checkedFound = false;
        var selectedCount = 0;
        var maxSelected = 15;
        $("form#facetRefineForm").find(":input.fqs").each(function(i, el) {
            //console.log("checking ", el);
            if ($(el).is(':checked')) {
                checkedFound = true;
                selectedCount++;
                fq += $(el).val() + " OR ";
                //return false; // break loop
            }
        });
        fq = fq.replace(/ OR $/, ""); // remove trailing OR

        if (facetName == "species_guid" && false) {
            // TODO: remove once service is fixed for this
            alert("Searching with multiple species is temporarily unavailable due to a technical issue. This should be fixed soon.");
        } else if (checkedFound && selectedCount > maxSelected) {
            alert("Too many options selected - maximum is " + maxSelected + ", you have selected " + selectedCount + ", please de-select " +
                (selectedCount - maxSelected) + " options");
        } else if (checkedFound) {
            //$("form#facetRefineForm").submit();
            var hash = window.location.hash;
            window.location.href = window.location.pathname + BC_CONF.searchString + "&fq=" + fq + hash;
        } else {
            alert("Please select at least one checkbox.");
        }
    });

    // QTip generated tooltips
    if($.fn.qtip.plugins.iOS) { return false; }

    $("a.multipleFacetsLink, a#downloadLink, a#alertsLink, a.tooltip, span.dropDown a, div#customiseFacets > a, a.removeLink").qtip({
        style: {
            classes: 'ui-tooltip-rounded ui-tooltip-shadow'
        },
        position: {
            target: 'event'
        }
    });

    // maultiple facets popup - sortable column heading links
    $("a.fsort").live("click", function(e) {
        e.preventDefault();
        var fsort = $(this).data('sort');
        var foffset = $(this).data('foffset');
        var table = $(this).closest('table');
        if (table.length == 0) {
            //console.log("table 1", table);
            table = $(this).parent().siblings('table#fullFacets');
        }
        //console.log("table 2", table);
        var facetName = $(table).data('facet');
        var displayName = $(table).data('label');
        //loadMultiFacets(facetName, displayName, criteria, foffset);
        loadFacetsContent(facetName, fsort, foffset, BC_CONF.facetLimit, true);
    });

    // loadMoreValues (legacy - now handled by inview)
    $("a.loadMoreValues").live("click", function(e) {
        e.preventDefault();
        var link = $(this);
        var fsort = link.data('sort');
        var foffset = link.data('foffset');
        var table = $("table#fullFacets");
        //console.log("table 2", table);
        var facetName = $(table).data('facet');
        var displayName = $(table).data('label');
        //loadMultiFacets(facetName, displayName, criteria, foffset);
        loadFacetsContent(facetName, fsort, foffset, BC_CONF.facetLimit, false);
    });

    // Inview trigger to load more values when tr comes into view
    $("tr#loadMore").live("inview", function() {
        var link = $(this).find("a.loadMoreValues");
        console.log("inview", link);
        var fsort = link.data('sort');
        var foffset = link.data('foffset');
        var table = $("table#fullFacets");
        //console.log("table 2", table);
        var facetName = $(table).data('facet');
        var displayName = $(table).data('label');
        //loadMultiFacets(facetName, displayName, criteria, foffset);
        loadFacetsContent(facetName, fsort, foffset, BC_CONF.facetLimit, false);
    });

    // Email alert buttons
    var alertsUrlPrefix = "http://alerts.ala.org.au/ws/";
    $("a#alertNewRecords, a#alertNewAnnotations").click(function(e) {
        e.preventDefault();
        var query = $("<p>"+BC_CONF.queryString+"</p>").text(); // strips <span> from string
        var fqueries = [];
        var fqtext = $("span.activeFq").each(function() { fqueries.push($(this).text()); });
        if (fqtext) {
            var fqueryString = fqueries.join("; ");
            if(fqueryString.length > 0){
                query += " (" + fqueryString + ")"; // append the fq queries to queryString
            }
        }
        //console.log("fqueries",fqueries, query);
        var methodName = $(this).data("method");
        var url = alertsUrlPrefix + methodName + "?";
        url += "queryDisplayName="+encodeURIComponent(query);
        url += "&baseUrlForWS=" + encodeURIComponent(BC_CONF.biocacheServiceUrl.replace(/\/ws$/,""));
        url += "&baseUrlForUI=" + encodeURIComponent(BC_CONF.serverName);
        url += "&webserviceQuery=%2Fws%2Foccurrences%2Fsearch" + encodeURIComponent(BC_CONF.searchString);
        url += "&uiQuery=%2Foccurrences%2Fsearch%3Fq%3D*%3A*";
        url += "&resourceName=" + encodeURIComponent(BC_CONF.resourceName);
        //console.log("url", query, methodName, url);
        window.location.href = url;
    });
}); // end JQuery document ready

/**
 * draws the div for selecting multiple facets (popup div)
 */
function loadMultiFacets(facetName, displayName, fsort, foffset) {
    fsort = (fsort) ? fsort : "count";
    foffset = (foffset) ? foffset : "0";
    var facetLimit = BC_CONF.facetLimit;
    //$("#dynamic").html("Loading...");
    var facet = facetName; //(facetName == "occurrence_year") ? "year" : facetName; // Date facets have different name
    //console.log("loadMultiFacets", facetName,  displayName, fsort);
    // pull params out of BC_CONF.searchString
    var params = BC_CONF.searchString.replace(/^\?/, "").split("&");
    var inputsHtml = "";
    $.each(params, function(i, el) {
        var pair = el.split("=");
        if (pair.length == 2) {
            inputsHtml += "<input type='hidden' name='" + pair[0] + "' value='" + pair[1] + "'/>";
        }
    });
    // draw the table and buttons
    //$("#dynamic").html(""); // reset div
    var html = "<form name='facetRefineForm' id='facetRefineForm' method='GET' action='" +
                BC_CONF.contextPath + "/occurrences/search/facets'>";
    html += inputsHtml ;// add existing params
    html += "<table class='compact scrollTable' id='fullFacets' data-facet='" + facet + "' data-label='" + displayName + "'>";
    html += "<thead class='fixedHeader'><tr class='tableHead'><th>&nbsp;</th><th id='indexCol'><a href='#index' class='fsort' data-sort='index' data-foffset='0' title='Sort by " + displayName + "'>" + displayName + "</a></th>";
    html += "<th><a href='#count' class='fsort' data-sort='count' title='Sort by record count'>Count</a></th></tr></thead>";
    html += "<tbody class='scrollContent'><tr id='loadingRow'><td colspan='3'>Loading... <img src='" + BC_CONF.contextPath + "/static/images/loading.gif' alt='loading'/></td></tr></tbody>";
    //html += "<tfoot><tr id='submitFacets'><td colspan='3'><input type='submit' class='submit'/></form></td></tr></tfoot>"; // empty row that gets loaded via AJAX
    html += "</table><div id='submitFacets'><input type='submit' class='submit'/></div></form>";
    //html += "<input type='submit' class='submit'/></form>";
    $("div#dynamic").append(html);
    $("a.fsort").qtip({
        style: {
            classes: 'ui-tooltip-rounded ui-tooltip-shadow'
        },
        position: {
            target: 'mouse',
            adjust: {
                x: 8, y: 12
            }
        }
    });
    // perform ajax
    loadFacetsContent(facet, fsort, foffset, facetLimit);
}

function loadFacetsContent(facetName, fsort, foffset, facetLimit, replaceFacets) {
    var jsonUri = BC_CONF.contextPath + "/occurrences/facet/values.json" + BC_CONF.searchString +
        "&facets=" + facetName + "&flimit=" + facetLimit + "&fsort=" + fsort + "&foffset=" + foffset;
    $.getJSON(jsonUri, function(data) {
        //console.log("data",data);

        if (data.length > 0) {
            var hasMoreFacets = false;
            var html = "";
            $("tr#loadingRow").remove(); // remove the loading message
            $("tr#loadMore").remove(); // remove the load more records link
            if (replaceFacets) {
                // remove any facet values in table
                $("table#fullFacets tr").not("tr.tableHead").remove();
            }
            $.each(data, function(i, el) {
                if (el.count > 0) {
                    // surround with quotes: fq value if contains spaces but not for range queries
                    var fqEsc = ((el.label.indexOf(" ") != -1 || el.label.indexOf("lsid") != -1) && el.label.indexOf("[") != 0)
                        ? "\"" + el.label + "\""
                        : el.label; // .replace(/:/g,"\\:")
                    var label = el.displayLabel;
                    if (label.indexOf("@") != -1) {
                        label = label.substring(0,label.indexOf("@"));
                    }
                    var link = BC_CONF.searchString.replace("'", "&apos;") + "&fq=" + facetName + ":" + fqEsc;
                    var rowType = (i % 2 == 0) ? "normalRow" : "alternateRow";
                    html += "<tr class='" + rowType + "'><td>" +
                        "<input type='checkbox' name='fqs' class='fqs' value='"  + facetName + ":" + fqEsc +
                        "'/></td><td><a href='" + link + "'> " + label + "</a></td><td style='text-align: right'>" + el.count + "</td></tr>";
                }
                if (i == facetLimit - 1) {
                    //console.log("got to end of page of facets: " + i);
                    hasMoreFacets = true;
                }
            });
            $("table#fullFacets tbody").append(html);
            // Fix some border issues
            $("table#fullFacets tr:last td").css("border-bottom", "1px solid #CCCCCC");
            $("table#fullFacets td:last-child, table#fullFacets th:last-child").css("border-right", "none");
            //$("tr.hidden").fadeIn('slow');

            if (hasMoreFacets) {
                var offsetInt = Number(foffset);
                var flimitInt = Number(facetLimit);
                var loadMore =  "<tr id='loadMore' class=''><td colspan='3'><a href='#index' class='loadMoreValues' data-sort='" +
                    fsort + "' data-foffset='" + (offsetInt + flimitInt) +
                    "'>Loading " + facetLimit + " more values...</a></td></rt>";
                $("table#fullFacets tbody").append(loadMore);
                //$("tr#loadMore").fadeIn('slow');
            }

            var tableHeight = $("#fullFacets tbody").height();
            var tbodyHeight = 0;
            $("#fullFacets tbody tr").each(function(i, el) {
                tbodyHeight += $(el).height();
            });
            //console.log("table heights", tableHeight, tbodyHeight);
            if (tbodyHeight < tableHeight) {
                // no scroll bar so adjust column widths
                var thWidth = $(".scrollContent td + td + td").width() + 18; //$("th#indexCol").width() + 36;
                $(".scrollContent td + td + td").width(thWidth);

            }
            //$.fancybox.resize();
        }
    });
}