class KeyPressListener {
    constructor(keyCode, callback){
        let keySafe = true;
        this.keydownFuction = function(event){
            if(event.code === keyCode){
                if(keySafe) {
                    keySafe = false;
                    callback();
                }
            }
        };
        this.keyupFunction = function(event){
            if(event.code === keyCode){
                keySafe = true;
            }
        };

        document.addEventListener("keydown", this.keydownFuction);
        document.addEventListener("keyup", this.keyupFunction);
    }

    unbind(){
        document.removeEventListener("keydown", this.keydownFuction);
        document.removeEventListener("keyup", this.keyupFunction);
    }
}