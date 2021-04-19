function getProductID(item) {
    if(item.hasOwnProperty('clave') && item.clave.hasOwnProperty('clave_original') && item.clave.clave_original != '') {
        if( item.clave.clave_original.indexOf('.') > 0 ) { return item.clave.clave_original;}
    }
    else return buildIDFromClave(item.clave);
}

function buildIDFromClave(clave) {
    let parts = [];

    if( clave.hasOwnProperty('clave1_grupo_id') && clave.clave1_grupo_id != '' ) parts.push(clave.clave1_grupo_id);
    if( clave.hasOwnProperty('clave2_especifico_id') && clave.clave2_especifico_id != '' ) parts.push(clave.clave2_especifico_id);
    if( clave.hasOwnProperty('clave3_diferenciador_id') && clave.clave3_diferenciador_id != '' ) parts.push(clave.clave3_diferenciador_id);
    if( clave.hasOwnProperty('clave4_variante_id') && clave.clave4_variante_id != '' ) parts.push(clave.clave4_variante_id);

    return parts.join('.');
}

function handleMedicalProduct(item, product) {
    if(item.hasOwnProperty('clave') && item.clave.hasOwnProperty('clave1_grupo_id')) {
        switch(item.clave.clave1_grupo_id) {
            case '010':
            case '020':
            case '030':
            case '040':
                if(item.hasOwnProperty('descripcion') && item.descripcion != '') {
                    let offset = item.descripcion.indexOf('. ');
                    let drugUnit = item.descripcion.substring(0, offset).trim();
                    let activeIngredient = item.descripcion.substring(offset+1).trim();
                    if(drugUnit != '') Object.assign(product, { drugUnit: drugUnit });
                    if(activeIngredient != '') Object.assign(product, { activeIngredient: activeIngredient });
                }

                if(item.hasOwnProperty('grupo'))
                    Object.assign(product, { drugClass: { identifier: item.grupo.id, name: item.grupo.nombre, recognizingAuthority: "IMSS", code: "CBM" } });

                if(item.hasOwnProperty('dosis') && item.dosis != '')
                    Object.assign(product, { dosageForm: item.dosis });

                if(item.hasOwnProperty('generalidades') && item.generalidades != '')
                    Object.assign(product, { mechanismOfAction: item.generalidades });

                if(item.hasOwnProperty('riesgo_embarazo') && item.riesgo_embarazo != '') {
                    let pregnancyWarning = '';
                    let pregnancyCategory = '';
                    let pregnancyCategoryMxIMSS = item.riesgo_embarazo;
                    let pOffset = item.riesgo_embarazo.indexOf('. ');

                    if(pOffset < 0) pregnancyWarning = item.riesgo_embarazo;
                    else {
                        pregnancyCategory = getPregnancyCategory(item.riesgo_embarazo.substring(0, pOffset).trim());
                        pregnancyWarning = item.riesgo_embarazo.substring(pOffset+1).trim();
                    }

                    Object.assign(product, { pregnancyWarning: pregnancyWarning, pregnancyCategoryMxIMSS: pregnancyCategoryMxIMSS });
                    if(pregnancyCategory) Object.assign(product, { pregnancyCategory: pregnancyCategory });
                }

                let guideline = {}
                if(item.hasOwnProperty('indicaciones') && item.indicaciones.length > 0) {
                    let indications = []
                    item.indicaciones.map( i => {
                        let trimmed = i.trim();
                        if( trimmed.charAt( trimmed.length - 1 ) == '.' ) indications.push( trimmed.substring(0, trimmed.length - 1) );
                        else indications.push(trimmed);
                    } )
                    Object.assign(guideline, { indicationsMxIMSS: indications });
                }
                if(item.hasOwnProperty('contraindicaciones') && item.contraindicaciones != '')
                    Object.assign(guideline, { contraindicationsMxIMSS: item.contraindicaciones });
                if(guideline != {}) Object.assign(product, { guideline: guideline });

                let warning = {}
                if(item.hasOwnProperty('precauciones') && item.precauciones != '')
                    Object.assign(warning, { precautionsMxIMSS: item.precauciones });
                if(item.hasOwnProperty('efectos_adversos') && item.efectos_adversos != '')
                    Object.assign(warning, { adverseEffectsMxIMSS: item.efectos_adversos });
                if(warning != {}) Object.assign(product, { warning: warning });

                if(item.hasOwnProperty('interacciones') && item.interacciones != '')
                    Object.assign(product, { interactionsMxIMSS: item.interacciones });
                break;
        }
    }
}

function getPregnancyCategory(string) {
    switch(string) {
        case 'A': return 'FDAcategoryA';
        case 'B': return 'FDAcategoryB';
        case 'C': return 'FDAcategoryC';
        case 'D': return 'FDAcategoryD';
        case 'X': return 'FDAcategoryX';
        default: return 'FDAnotEvaluated';
    }
}

function productObject(item, metadata=null) {
    let productID = getProductID(item);

    let product = {
        id: productID,
        name: item.nombre,
        description: item.hasOwnProperty('descripcion')? item.descripcion : '',
        disambiguatingDescription: item.hasOwnProperty('presentacion')? item.presentacion : '',
        cbmei: item.clave
    }

    if(item.hasOwnProperty('rubro') && item.rubro != '') {
        // Aquí se colocará el mapeo para poder meter algo en classification, rubro se vuelve subclassification
        let correctedRubro = item.rubro.trim();
        if( correctedRubro.charAt( correctedRubro.length - 1 ) == '.' ) correctedRubro = correctedRubro.substring(0, correctedRubro.length - 1);
        Object.assign(product, { subclassification: correctedRubro.charAt(0).toUpperCase() + correctedRubro.substring(1).toLowerCase() });
    }

    handleMedicalProduct(item, product);

    if (metadata && metadata.dataSource) {
        const dataSource = { id: metadata.dataSource };
        const dataSourceRun = { id: metadata.dataSourceRun };
        Object.assign(product, { source: [ dataSource ], sourceRun: [ dataSourceRun ] });
    }
    return product;
}

module.exports = productObject;
