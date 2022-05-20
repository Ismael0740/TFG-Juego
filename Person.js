class Person extends GameObject {
  constructor(config) {
    super(config);
    this.movingProgressRemaining = 0;//Esta variable es progresiva hasta 0 e indica la cantidad de pixeles que le queda por recorrer en animacion.
    //Es decir, cada casilla que se desplace el personaje hara que esta variable se convierta en 16 y pase hasta 0
    //(si no tuvieramos esto y fuera un cambio de ubicacion instantaneo el personaje se teletransportaria de golpe a la siguiente ubicacion,
    //de esta manera los va recorriendo de manera organica)
    this.isStanding = false;


    this.isPlayerControlled = config.isPlayerControlled || false;

    this.directionUpdate = {
      "up": ["y", -1],
      "down": ["y", 1],
      "left": ["x", -1],
      "right": ["x", 1],
    }
  }

  update(state) {
    if (this.movingProgressRemaining > 0) {
      this.updatePosition();
    } else {
      //Pasara si tenemos control del personaje y hay una tecla de direccion pulsada
      if (!state.map.isCutscenePlaying && this.isPlayerControlled && state.arrow) {
        this.startBehavior(state, {
          type: "walk",
          direction: state.arrow
        })
      }
      this.updateSprite(state);
    }
  }

  startBehavior(state, behavior) {
    this.direction = behavior.direction;//Pone la direccion del personaje en la misma que el behavior

    
    if (behavior.type === "walk") {
      //Para si el espacio no esta libre
      if (state.map.isSpaceTaken(this.x, this.y, this.direction)) {

        behavior.retry && setTimeout(() => {
          this.startBehavior(state, behavior)
        }, 10);

        return;
      }

      //Puede andar
      state.map.moveWall(this.x, this.y, this.direction); //Desplaza el muro de encima de nuestra posicion a justo la posicion a la que nos queremos mover.
                                                          //Como justo despues mandamos la orden de desplazarse y ya ha pasado la comprobacion para saber si podemos o no movernos dependiendo de si hay delante un muro,
                                                          //podemos movernos aunque hayamos puesto un muro justo en la linea anterior.
                                                          //Realmente de esta manera podemos simular que nuestro personaje ocupa un espacio y que cada vez que nos desplazamos ocupamos uno diferente.
                                                          //(Si alguien intenta desplazarse a la ubicacion del personaje no podra, porque lo bloque este muro)

      this.movingProgressRemaining = 16;
      this.updateSprite(state);
    }

    if (behavior.type === "stand") {
      this.isStanding = true;
      setTimeout(() => {
        utils.emitEvent("PersonStandComplete", {
          whoId: this.id
        })
        this.isStanding = false;
      }, behavior.time)
    }

  }

  updatePosition() {
      const [property, change] = this.directionUpdate[this.direction];
      this[property] += change;
      this.movingProgressRemaining -= 1;

      if (this.movingProgressRemaining === 0) {
        //Ha terminado de andar
        utils.emitEvent("PersonWalkingComplete", {
          whoId: this.id
        })

      }
  }

  updateSprite() {
    if (this.movingProgressRemaining > 0) {
      this.sprite.setAnimation("walk-"+this.direction);
      return;
    }
    this.sprite.setAnimation("idle-"+this.direction);    
  }

}