(function () {
   //Instancia el Overworld con los datos del game-container,
  //es decir, con los datos especificados en la etiqueta con el mismo nombre del html,
  //Al ser una constante no puede cambiar, es decir, es importante saber que siempre trabajaremos con el mismo Overworld ya que ES LA BASE del programa
  const overworld = new Overworld({
    element: document.querySelector(".game-container")
  });
  overworld.init(); //llama al metodo init de Overworld

})();