const fs = require('fs');

// Crear un arreglo vacío para almacenar los objetos "location"
var locations = [];

// Función para añadir un nuevo objeto "location" al arreglo
function addLocation() {
    var location = {
        lat: 19.405544,
        lng: -99.171532,
        time: "15:52:14",
        date: "",
        id: "",
    };
    locations.push(location);
    console.log('Nuevo location añadido al arreglo');
}

// Función para editar un objeto "location" específico en el arreglo
function editLocation(index) {
    if (index < 0 || index >= locations.length) {
        console.log('Index fuera de rango');
        return;
    }
    locations[index].time = "18:40:00";
    console.log('location en el index ' + index + ' ha sido editado');
}

// Añadir un nuevo objeto "location" al arreglo
//addLocation();
//existeJSON();
//borrarJSON();
// Editar un objeto "location" específico en el arreglo
//var index = 0;
//editLocation(index);

// Convertir el arreglo a una cadena JSON
var locationsJSON = JSON.stringify(locations);

// Guardar locationsJSON en un archivo
fs.writeFileSync('DataFutures.json', locationsJSON);
console.log('locations guardado en locations.json');

///Borrar json
function borrarJSON() {
    fs.writeFileSync('DataFutures.json', '');
    console.log('JSON borrado exitosamente');
  }

  ///// existe json
  function existeJSON() {
    if (fs.existsSync('DataFutures.json')) {
      const content = fs.readFileSync('DataFutures.json', 'utf-8');
      const parsedContent = JSON.parse(content);
      return Array.isArray(parsedContent) && parsedContent.length > 0;
    }
    return false;
  }
  
  if (existeJSON()) {
    console.log('El archivo JSON existe y tiene contenido');
  } else {
    console.log('El archivo JSON no existe o está vacío');
  }
  
  
  
  
  
  