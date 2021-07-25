const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

// innerWidth is a window property, so no need to write window.innerWidth
canvas.width = innerWidth;
canvas.height = innerHeight;

class Player{
    constructor(x, y, radius, color){
        // the RHS (elements after = ) are what we specify when we 
        // call the constructor to create a new player
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    //FUNCTION to draw the player - you can name it whatever you want
    //From 0 (start angle) to Math.Pi * 2 (finish angle) we have a full circle
    draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}


class Projectile{
    constructor(x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update(){
        this.x = this.x + this.velocity;
        this.y = this.y + this.velocity;
    }
}

const x = canvas.width / 2;
const y = canvas.height / 2;

const player = new Player(x, y, 30, 'red');
player.draw();
console.log(canvas);
console.log(ctx);
console.log(player);

const projectile = new Projectile(canvas.width / 2, canvas.height / 2, 5, 'blue', {x: 1, y: 1});
projectile.draw();
projectile.update();

//FUNCTION to animate
function animate(){
    requestAnimationFrame(animate);
    projectile.draw();
    projectile.update();
    
}

// window.addEventListener same as, addEventListener
addEventListener('click', (event)=>{
   
});

animate();