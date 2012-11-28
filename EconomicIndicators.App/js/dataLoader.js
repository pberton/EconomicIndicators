(function () {
    "use strict";

    var list = new WinJS.Binding.List();
    var groupedItems = list.createGrouped(
        function groupKeySelector(item) { return item.group.key; },
        function groupDataSelector(item) { return item.group; }
    );

    // Create an load data
    createData();
    loadData();

    WinJS.Namespace.define("Data", {
        items: groupedItems,
        groups: groupedItems.groups,
        getItemReference: getItemReference,
        getItemsFromGroup: getItemsFromGroup,
        resolveGroupReference: resolveGroupReference,
        resolveItemReference: resolveItemReference,
        loadData : loadData
    });

    // Get a reference for an item, using the group key and item title as a
    // unique reference to the item that can be easily serialized.
    function getItemReference(item) {
        return [item.group.key, item.title];
    }

    // This function returns a WinJS.Binding.List containing only the items
    // that belong to the provided group.
    function getItemsFromGroup(group) {
        return list.createFiltered(function (item) { return item.group.key === group.key; });
    }

    // Get the unique group corresponding to the provided group key.
    function resolveGroupReference(key) {
        for (var i = 0; i < groupedItems.groups.length; i++) {
            if (groupedItems.groups.getAt(i).key === key) {
                return groupedItems.groups.getAt(i);
            }
        }
    }

    // Get a unique item from the provided string array, which should contain a
    // group key and an item title.
    function resolveItemReference(reference) {
        for (var i = 0; i < groupedItems.length; i++) {
            var item = groupedItems.getAt(i);
            if (item.group.key === reference[0] && item.title === reference[1]) {
                return item;
            }
        }
    }

    // Creats array of data that will be added to the application's
    // data list. 
    function createData() {

        // Each of these sample groups must have a unique key to be displayed
        // separately.
        var sampleGroups = [
            { key: "Indicadores", title: "Banco Central", subtitle: "Indicadores del Banco Central de Chile", backgroundImage: "/images/bcch-01.jpg", description: "El Banco Central de Chile es un organismo autónomo, de rango constitucional, de carácter técnico, con personalidad jurídica, patrimonio propio y duración indefinida." },
        ];

        // Each of these sample items should have a reference to a particular
        // group.
        var sampleItems = [
            { group: sampleGroups[0], title: "Unidad de Fomento", subtitle: "Valor actual: $ - ", description: "Valor de la Unidad de Fomento en Chile", content: "La Unidad de Fomento (UF) es una unidad de cuenta reajustable de acuerdo con la inflación, usada en Chile. Su código ISO 4217 es CLF. Fue creada por el Decreto Nº 40 del 20 de enero de 1967, siendo su principal y original uso en los préstamos hipotecarios, ya que era una forma de revalorizarlos de acuerdo con las variaciones de la inflación.", backgroundImage: "/images/UF.jpg", series : new WinJS.Binding.List() },
            { group: sampleGroups[0], title: "Indice de valor promedio", subtitle: "Valor actual: $ - ", description: "Valor del Indice de valor promedio", content: "El Índice de Valor Promedio (IVP) es uno de los sistemas de reajustabilidad autorizados por el Banco Central de Chile al amparo de lo establecido en el número 9 del artículo 35 de su Ley Orgánica Constitucional.", backgroundImage: "/images/IVP.jpg", series : new WinJS.Binding.List()  },
            { group: sampleGroups[0], title: "Dólar observado", subtitle: "Valor actual: $ - ", description: "Valor del Dólar observado en Chile", content: "Es el promedio de los precios del dólar registrados en las transacciones de un día determinado.", backgroundImage: "/images/dollar.jpg", series : new WinJS.Binding.List()  },
            { group: sampleGroups[0], title: "Euro", subtitle: "Valor actual: $ - ", description: "Valor del Euro en Chile", content: "El euro (€) es la moneda oficial de 20 países entre ellos 17 de los 27 estados miembros de la Unión Europea (UE) conocidos colectivamente como la Eurozona.", backgroundImage: "/images/euro.jpg", series : new WinJS.Binding.List()  },
        ];

        sampleItems.forEach(function (item) {
            list.push(item);
        });
    }

    // Loads the information in the data array for the application
    function loadData() {

        var queryUrl = "http://si3.bcentral.cl/Indicadoressiete/secure/Indicadoresdiarios.aspx";

        WinJS.xhr({ url: queryUrl }).done(
            function fulfilled(result) {
                if (result.status === 200) {

                    var resDiv = document.createElement("div");
                    resDiv.innerHTML = toStaticHTML(result.responseText);

                    // Each of these sample items should have a reference to a particular
                    // group.
                    LoadItemData(0, resDiv.querySelector("#lblValor1_1").innerText, resDiv.querySelector("#hypLnk1_1").href);
                    LoadItemData(1, resDiv.querySelector("#lblValor1_2").innerText, resDiv.querySelector("#hypLnk1_2").href);
                    LoadItemData(2, resDiv.querySelector("#lblValor1_3").innerText, resDiv.querySelector("#hypLnk1_3").href);
                    LoadItemData(3, resDiv.querySelector("#lblValor1_5").innerText, resDiv.querySelector("#hypLnk1_5").href);

                    list.notifyReload();
                }
            });
    }

    // Loads one item serie data
    function LoadItemData(id, value, link) {
        var item = list.getItem(id).data;
        item.subtitle = "Valor actual: $ " + value;

        while (item.series.length > 0)
            item.series.pop();

        var baseQueryUrl = "http://si3.bcentral.cl/Indicadoressiete/secure";

        link = baseQueryUrl + link.substring(link.lastIndexOf('/'));

        WinJS.xhr({ url: link }).done(
            function fulfilled(result) {
                if (result.status === 200) {

                    var resDiv = document.createElement("div");
                    resDiv.innerHTML = toStaticHTML(result.responseText);

                    var months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
                    months.reverse().forEach(function (month) {
                        for (var i = 32; i > 0; i--) {
                            var dataItem = resDiv.querySelector("#gr_ctl" + ("0" + i).slice(-2) + "_" + month);
                            if (dataItem != null && dataItem.innerText != "")
                                item.series.push({ date: (i - 1) + " de " + month, value: dataItem.innerText });
                        }
                    });
                }
            });
    }
})();
